const ROUTERS = require("../constants/uniswapRoutes.json")
const UniswapV2Router02Json = require('../test/abi/UniswapV2Router02.json');

module.exports = async function (taskArgs, hre) {
	const signers = await ethers.getSigners()
	const owner = signers[0]
	const uniswapRouter = new ethers.Contract(ROUTERS[hre.network.name], UniswapV2Router02Json.abi, owner);
	const weth = await uniswapRouter.WETH();

	const oft = await ethers.getContract("OFT");

	let oftAmount = ethers.utils.parseEther(taskArgs.tokenAmount);
	let ethAmount = ethers.utils.parseEther(taskArgs.ethAmount);

	let tx = await (await oft.approve(uniswapRouter.address, oftAmount)).wait();
	console.log(`Approve tx: ${tx.transactionHash}`);

	const blockNumber = await ethers.provider.getBlockNumber();
	const block = await ethers.provider.getBlock(blockNumber);
	const deadline = block.timestamp + 5 * 60; // 5 minutes from the current time

	tx = (await uniswapRouter.addLiquidityETH(oft.address, oftAmount, oftAmount, ethAmount, owner.address, deadline, { value: ethAmount })).wait();
	console.log(`Add liquidity tx: ${tx.transactionHash}`);
}