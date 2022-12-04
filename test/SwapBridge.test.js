const { expect } = require("chai")
const { ethers } = require("hardhat")
const { utils, constants } = require("ethers");
const { createUniswap } = require("./helpers");

describe("SwapBridge", function () {
	const mainnetId = 101
	const goerliEthId = 10121

	let owner, uniswap, goerliEthNativeOFT, goerliEthOFT, weth, swapBridge

	before(async () => {
		[owner] = await ethers.getSigners();
		const wethFactory = await ethers.getContractFactory("WETH9");
		weth = await wethFactory.deploy();
		uniswap = await createUniswap(owner, weth)
	})

	beforeEach(async () => {
		const endpointFactory = await ethers.getContractFactory("LayerZeroEndpoint")
		const mainnetEndpoint = await endpointFactory.deploy(mainnetId);
		const goerliEndpoint = await endpointFactory.deploy(goerliEthId);		
		
		const goerliEthOFTFactory = await ethers.getContractFactory("OFT");
		goerliEthOFT = await goerliEthOFTFactory.deploy("Goerli ETH OFT", "ETH", mainnetEndpoint.address);

		const goerliEthNativeOFTFactory = await ethers.getContractFactory("NativeOFT");
		goerliEthNativeOFT = await goerliEthNativeOFTFactory.deploy("Goerli ETH Native OFT", "ETH", goerliEndpoint.address);

		const swapBridgeFactory = await ethers.getContractFactory("SwapBridge");
		swapBridge = await swapBridgeFactory.deploy(goerliEthOFT.address, uniswap.router.address, goerliEthId);

		await goerliEthOFT.setTrustedRemoteAddress(goerliEthId, goerliEthNativeOFT.address);
		await goerliEthNativeOFT.setTrustedRemoteAddress(mainnetId, goerliEthOFT.address);		
	})

	describe("bridges native Goerli ETH to mainnet", function () {
		beforeEach(async () => {

		})

		it("Goerli ETH OFT is on mainnet", async () => {

		})

		describe("creates ETH - ETH Goerli OFT pool on mainnet", function () {
			beforeEach(async () => {
				const goerliEthAmount = utils.parseEther("20");
				const ethAmount = utils.parseEther("10");
				await goerliEthOFT.deposit({ value: goerliEthAmount });
				await goerliEthOFT.approve(uniswap.router.address, goerliEthAmount);
				await uniswap.router.addLiquidityETH(goerliEthOFT.address, goerliEthAmount, goerliEthAmount, ethAmount, owner.address, 2e9, { value: ethAmount });
			})

			it("swaps and bridges to testnet", async () => {
				// const amountIn = utils.parseEther("0.1");
				// const amounts = await uniswap.router.getAmountsOut(amountIn, [weth.address, goerliEthOFT.address]);
				// const amountOutMin = amounts[1];
				// await goerliEthOFT.approve(swapBridge.address, amountOutMin);
				// await swapBridge.swapAndBridge(amountIn, amountOutMin, owner.address, constants.AddressZero, "0x", { value: utils.parseEther("0.2") });
			})
		})
	})	
})
