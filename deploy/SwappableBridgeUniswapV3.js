const ROUTERS = require("../constants/swapRouters.json")
const WETHS = require("../constants/weths.json")

module.exports = async function ({ deployments, getNamedAccounts }) {
	const { deploy } = deployments
	const { deployer } = await getNamedAccounts()
	console.log(`Deployer Address: ${deployer}`)

	const routerAddress = ROUTERS[hre.network.name]
	console.log(`[${hre.network.name}] Uniswap V3 SwapRouter Address: ${routerAddress}`)

	const wethAddress = WETHS[hre.network.name]
	console.log(`[${hre.network.name}] WETH Address: ${wethAddress}`)

	const oft = await ethers.getContract("OFT")
	console.log(`[${hre.network.name}] OFT Address: ${oft.address}`)

	await deploy("SwappableBridgeUniswapV3", {
		from: deployer,
		args: [wethAddress, oft.address, routerAddress],
		log: true,
		waitConfirmations: 1,
	})
}

module.exports.tags = ["SwappableBridgeUniswapV3"]