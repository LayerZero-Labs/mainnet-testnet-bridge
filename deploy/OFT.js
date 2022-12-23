const LZ_ENDPOINTS = require("../constants/layerzeroEndpoints.json")
const OFT_ARGS = require("../constants/oftArgs.json")

module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    console.log(`>>> your address: ${deployer}`)

    const lzEndpointAddress = LZ_ENDPOINTS[hre.network.name]
    console.log(`[${hre.network.name}] Endpoint Address: ${lzEndpointAddress}`)
    const oftArgs = OFT_ARGS[hre.network.name]
    const constructorArgs = oftArgs.useMinAmount 
        ? [oftArgs.name, oftArgs.symbol, lzEndpointAddress, ethers.utils.parseEther(oftArgs.minAmount)] 
        : [oftArgs.name, oftArgs.symbol, lzEndpointAddress]

    await deploy(oftArgs.contractName, {
        from: deployer,
        args: constructorArgs,
        log: true,
        waitConfirmations: 1,
    })
}

module.exports.tags = ["OFT"]