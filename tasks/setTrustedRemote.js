const CHAIN_IDS = require("../constants/chainIds.json")
const { getDeploymentAddresses } = require("../utils/readStatic")
const OFT_ARGS = require("../constants/oftArgs.json")
const NATIVE_OFT_ARGS = require("../constants/nativeOftArgs.json")

module.exports = async function (taskArgs, hre) {
    const localChain = hre.network.name;
    const remoteChain = taskArgs.targetNetwork;

    const remoteChainId = CHAIN_IDS[remoteChain]

    const remoteOft = getDeploymentAddresses(remoteChain)[OFT_ARGS[remoteChain].contractName]
    const remoteNativeOft = getDeploymentAddresses(remoteChain)[NATIVE_OFT_ARGS[remoteChain].contractName]

    const oft = await ethers.getContract(OFT_ARGS[localChain].contractName)
    console.log(`[${localChain}] OFT Address: ${oft.address}`)

    const nativeOft = await ethers.getContract(NATIVE_OFT_ARGS[localChain].contractName)
    console.log(`[${localChain}] Native OFT Address: ${nativeOft.address}`)

    console.log(`[${remoteChain}] OFT Address: ${remoteOft}`)
    console.log(`[${remoteChain}] Native OFT Address: ${remoteNativeOft}`)

    let tx = await nativeOft.setTrustedRemoteAddress(remoteChainId, remoteOft)
    console.log(`native OFT setTrustedRemoteAddress tx: ${tx.hash}`)
    await tx.wait()

    tx = await oft.setTrustedRemoteAddress(remoteChainId, remoteNativeOft)
    console.log(`OFT setTrustedRemoteAddress tx: ${tx.hash}`)
    await tx.wait()
}