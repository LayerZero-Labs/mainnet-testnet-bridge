const ROUTERS = require("../constants/uniswapRoutes.json")

module.exports = async function ({ deployments, getNamedAccounts }) {
	const { deploy } = deployments
	const { deployer } = await getNamedAccounts()
	console.log(`>>> your address: ${deployer}`)

	const routerAddress = ROUTERS[hre.network.name]
	console.log(`[${hre.network.name}] Uniswap Router Address: ${routerAddress}`)

	const oft = await ethers.getContract("OFTV2");
	const oftAddress = oft.address;
	console.log(`[${hre.network.name}] OFT Address: ${oftAddress}`)

	const nativeOft = await ethers.getContract("NativeOFTV2");
	const nativeOftAddress = nativeOft.address;
	console.log(`[${hre.network.name}] Native OFT Address: ${nativeOftAddress}`)

	await deploy("SwappableBridge", {
		from: deployer,
		args: [oftAddress, nativeOftAddress, routerAddress],
		log: true,
		waitConfirmations: 1,
	})
}

module.exports.tags = ["SwappableBridge"]