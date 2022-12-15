const CHAIN_IDS = require("../constants/chainIds.json")
const { getDeploymentAddresses } = require("../utils/readStatic")

module.exports = async function (taskArgs, hre) {
	const remoteChainId = CHAIN_IDS[taskArgs.targetNetwork]

	const remoteOft = getDeploymentAddresses(taskArgs.targetNetwork)["OFT"]
	const remoteNativeOft = getDeploymentAddresses(taskArgs.targetNetwork)["NativeOFT"]

	const oft = await ethers.getContract("OFT");
	console.log(`[${hre.network.name}] OFT Address: ${oft.address}`)

	const nativeOft = await ethers.getContract("NativeOFT");
	console.log(`[${hre.network.name}] Native OFT Address: ${nativeOft.address}`)

	console.log(`[${taskArgs.targetNetwork}] OFT Address: ${remoteOft}`)
	console.log(`[${taskArgs.targetNetwork}] Native OFT Address: ${remoteNativeOft}`)

	let tx = await (await nativeOft.setTrustedRemoteAddress(remoteChainId, remoteOft)).wait();
	console.log(`native OFT setTrustedRemoteAddress tx: ${tx.transactionHash}`);

	tx = await (await oft.setTrustedRemoteAddress(remoteChainId, remoteNativeOft)).wait();
	console.log(`OFT setTrustedRemoteAddress tx: ${tx.transactionHash}`);
}