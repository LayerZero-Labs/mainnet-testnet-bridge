const WETHS = require("../constants/weths.json")
const OFT = {
	"ethereum": "0xE71bDfE1Df69284f00EE185cf0d95d0c7680c0d4",
	"sepolia-mainnet": "0x4f7A67464B5976d7547c860109e4432d50AfB38e",
}
const NATIVE_OFT = {
	"ethereum": "0x4f7A67464B5976d7547c860109e4432d50AfB38e",
	"sepolia-mainnet": "0x2e5221B0f855Be4ea5Cefffb8311EED0563B6e87",
}
const UNIVERSAL_ROUTER = {
	"ethereum": "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
	"sepolia-mainnet": "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
}

module.exports = async function ({ deployments, getNamedAccounts }) {
	const { deploy } = deployments
	const { deployer } = await getNamedAccounts()
	console.log(`Deployer Address: ${deployer}`)

	const wethAddress = WETHS[hre.network.name]
	console.log(`[${hre.network.name}] WETH Address: ${wethAddress}`)

	const oft = OFT[hre.network.name]
	console.log(`[${hre.network.name}] OFT Address: ${oft}`)

	const nativeOft = NATIVE_OFT[hre.network.name]
	console.log(`[${hre.network.name}] Native OFT Address: ${nativeOft}`)

	const universalRouter = UNIVERSAL_ROUTER[hre.network.name]
	console.log(`[${hre.network.name}] Universal Router Address: ${universalRouter}`)

	await deploy("SwappableBridgeUniswapV3", {
		from: deployer,
		args: [wethAddress, oft, nativeOft, universalRouter],
		log: true,
		waitConfirmations: 1,
	})
}

module.exports.tags = ["SwappableBridgeUniswapV3"]