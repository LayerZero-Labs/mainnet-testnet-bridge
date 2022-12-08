const { expect } = require("chai")
const { ethers } = require("hardhat")
const { utils, constants } = require("ethers");
const { createUniswap } = require("./helpers");

describe.only("SwappableBridge", function () {
	const mainnetId = 101
	const goerliEthId = 10121
	const sharedDecimals = 18;

	let owner, ownerAddressBytes32
	let ethUniswap, ethNativeOFT, ethOFT, weth, ethBridge
	let goerliEthUniswap, goerliEthNativeOFT, goerliEthOFT, goerliWeth, goerliEthBridge

	before(async () => {
		[owner] = await ethers.getSigners();
		ownerAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [owner.address]);
		const wethFactory = await ethers.getContractFactory("WETH9");
		weth = await wethFactory.deploy();
		ethUniswap = await createUniswap(owner, weth);

		goerliWeth = await wethFactory.deploy();
		goerliEthUniswap = await createUniswap(owner, goerliWeth);
	})

	beforeEach(async () => {
		const endpointFactory = await ethers.getContractFactory("LayerZeroEndpoint")
		const mainnetEndpoint = await endpointFactory.deploy(mainnetId);
		const goerliEndpoint = await endpointFactory.deploy(goerliEthId);
		
		const OFTFactory = await ethers.getContractFactory("OFTV2");
		ethOFT = await OFTFactory.deploy("ETH OFT", "ETH", sharedDecimals, goerliEndpoint.address);
		goerliEthOFT = await OFTFactory.deploy("Goerli ETH OFT", "ETH", sharedDecimals, mainnetEndpoint.address);

		const nativeOFTFactory = await ethers.getContractFactory("NativeOFTV2");
		ethNativeOFT = await nativeOFTFactory.deploy("ETH Native OFT", "ETH", sharedDecimals, mainnetEndpoint.address);
		goerliEthNativeOFT = await nativeOFTFactory.deploy("Goerli ETH Native OFT", "ETH", sharedDecimals, goerliEndpoint.address);

		const swappableBridgeFactory = await ethers.getContractFactory("SwappableBridge");
		ethBridge = await swappableBridgeFactory.deploy(goerliEthOFT.address, ethNativeOFT.address, ethUniswap.router.address);
		goerliEthBridge = await swappableBridgeFactory.deploy(ethOFT.address, goerliEthNativeOFT.address, goerliEthUniswap.router.address);

		await ethBridge.setRemoteBridge(goerliEthId, ethers.utils.defaultAbiCoder.encode(["address"], [goerliEthBridge.address]));
		await goerliEthBridge.setRemoteBridge(mainnetId, ethers.utils.defaultAbiCoder.encode(["address"], [ethBridge.address]));

		// internal bookkeeping for endpoints (not part of a real deploy, just for this test)
		await mainnetEndpoint.setDestLzEndpoint(ethOFT.address, goerliEndpoint.address);		
		await goerliEndpoint.setDestLzEndpoint(ethNativeOFT.address, mainnetEndpoint.address);

		await mainnetEndpoint.setDestLzEndpoint(goerliEthNativeOFT.address, goerliEndpoint.address);	
		await goerliEndpoint.setDestLzEndpoint(goerliEthOFT.address, mainnetEndpoint.address);

		await ethNativeOFT.setTrustedRemoteAddress(goerliEthId, ethOFT.address);
		await goerliEthNativeOFT.setTrustedRemoteAddress(mainnetId, goerliEthOFT.address);

		await goerliEthOFT.setTrustedRemoteAddress(goerliEthId, goerliEthNativeOFT.address);
		await ethOFT.setTrustedRemoteAddress(mainnetId, ethNativeOFT.address);
	})

	describe("bridges native Goerli ETH to mainnet", function () {
		const goerliAmount = utils.parseEther("10");		
		beforeEach(async () => {
			await goerliEthNativeOFT.deposit({ value: goerliAmount });
			const nativeFee = (await goerliEthNativeOFT.estimateSendFee(mainnetId, ownerAddressBytes32, goerliAmount, false, "0x")).nativeFee;
			await goerliEthNativeOFT.sendFrom(
				owner.address,
				mainnetId, // destination chainId
				ownerAddressBytes32, // destination address to send tokens to
				goerliAmount, // quantity of tokens to send (in units of wei)
				[owner.address, ethers.constants.AddressZero, "0x"], // adapterParameters empty bytes specifies default settings
				{ value: nativeFee.add(utils.parseEther("0.1")) } // pass a msg.value to pay the LayerZero message fee
			)
		})

		it("GoerliOFT is on mainnet", async () => {
			expect(await goerliEthOFT.balanceOf(owner.address)).to.be.equal(goerliAmount);
		})

		describe("creates ETH - ETH Goerli OFT pool on mainnet", function () {
			beforeEach(async () => {
				const amount = utils.parseEther("10");
				await goerliEthOFT.approve(ethUniswap.router.address, amount);
				await ethUniswap.router.addLiquidityETH(goerliEthOFT.address, amount, amount, amount, owner.address, 2e9, { value: amount });
			})

			it("swaps and bridges to testnet", async () => {
				const amountIn = utils.parseEther("0.1");
				const amounts = await ethUniswap.router.getAmountsOut(amountIn, [weth.address, goerliEthOFT.address]);
				const amountOutMin = amounts[1];

				await ethBridge.swapAndBridge(amountIn, amountOutMin, goerliEthId, [owner.address, constants.AddressZero, "0x"], { value: utils.parseEther("0.2") });
			})
		})
	})	
})
