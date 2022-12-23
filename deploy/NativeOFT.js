const LZ_ENDPOINTS = require("../constants/layerzeroEndpoints.json")
const NATIVE_OFT_ARGS = require("../constants/nativeOftArgs.json")

module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    console.log(`>>> your address: ${deployer}`)

    const lzEndpointAddress = LZ_ENDPOINTS[hre.network.name]
    console.log(`[${hre.network.name}] Endpoint Address: ${lzEndpointAddress}`)
    const nativeOftArgs = NATIVE_OFT_ARGS[hre.network.name]
    const constructorArgs = nativeOftArgs.useMinAmount
        ? [nativeOftArgs.name, nativeOftArgs.symbol, lzEndpointAddress, ethers.utils.parseEther(nativeOftArgs.minAmount)]
        : [nativeOftArgs.name, nativeOftArgs.symbol, lzEndpointAddress]

    await deploy(nativeOftArgs.contractName, {
        from: deployer,
        args: constructorArgs,
        log: true,
        waitConfirmations: 1,
    })
}

module.exports.tags = ["NativeOFT"]