const ROUTERS = require("../constants/uniswapRoutes.json")
const WETHS = require("../constants/weths.json")
const OFT_ARGS = require("../constants/oftArgs.json")

const routerAbi = [
	"function getAmountsOut(uint amountIn, address[] calldata path) view returns (uint[] memory amounts)"
]
module.exports = async function (taskArgs, hre) {
	const uniswapRouterAddress = ROUTERS[hre.network.name]
	const uniswapRouter = await hre.ethers.getContractAt(routerAbi, uniswapRouterAddress)
	const wethAddress = WETHS[hre.network.name]
	const oft = await ethers.getContract(OFT_ARGS[hre.network.name].contractName)

	// NOTE: using a small amount just to get a ratio
	const precision = 6;
	const amountIn = ethers.utils.parseUnits("1", precision)

	let amountsOut = await uniswapRouter.getAmountsOut(amountIn, [wethAddress, oft.address])
	const wethPriceInOFT = amountsOut[1]
	console.log(ethers.utils.formatUnits(wethPriceInOFT, precision))

	amountsOut = await uniswapRouter.getAmountsOut(amountIn, [oft.address, wethAddress])
	const oftPriceInWETH = amountsOut[1]
	console.log(ethers.utils.formatUnits(oftPriceInWETH, precision))
}