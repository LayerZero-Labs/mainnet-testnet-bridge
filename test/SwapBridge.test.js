const { expect } = require("chai")
const { ethers } = require("hardhat")
const { utils } = require("ethers");
const { createUniswap } = require("./helpers");

describe("SwapBridge", function () {
	const mainnetId = 101
	const testnetId = 10121

	let owner, uniswap, testnetNativeOFT, weth, swapBridge

	before(async () => {
		[owner] = await ethers.getSigners();
		const wethFactory = await ethers.getContractFactory("WETH9");
		weth = await wethFactory.deploy();
		uniswap = await createUniswap(owner, weth)
	})

	beforeEach(async () => {
		const endpointFactory = await ethers.getContractFactory("LayerZeroEndpoint")
		const mainnetEndpoint = await endpointFactory.deploy(mainnetId);
		const nativeOFTFactory = await ethers.getContractFactory("NativeOFT");
		testnetNativeOFT = await nativeOFTFactory.deploy("Goerli ETH", "ETH", mainnetEndpoint.address);
		const swapBridgeFactory = await ethers.getContractFactory("SwapBridge");
		swapBridge = await swapBridgeFactory.deploy(testnetNativeOFT.address, uniswap.router.address, testnetId);
	})

	it("swaps and bridges to testnet", async() => {

	})
})
