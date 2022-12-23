const ROUTERS = require("../constants/uniswapRoutes.json")
const OFT_ARGS = require("../constants/oftArgs.json")
const NATIVE_OFT_ARGS = require("../constants/nativeOftArgs.json")

module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    console.log(`>>> your address: ${deployer}`)

    const routerAddress = ROUTERS[hre.network.name]
    console.log(`[${hre.network.name}] Uniswap Router Address: ${routerAddress}`)

    const oft = await ethers.getContract(OFT_ARGS[hre.network.name].contractName)
    console.log(`[${hre.network.name}] OFT Address: ${oft.address}`)

    const nativeOft = await ethers.getContract(NATIVE_OFT_ARGS[hre.network.name].contractName)
    console.log(`[${hre.network.name}] Native OFT Address: ${nativeOft.address}`)

    await deploy("SwappableBridge", {
        from: deployer,
        args: [oft.address, nativeOft.address, routerAddress],
        log: true,
        waitConfirmations: 1,
    })
}

module.exports.tags = ["SwappableBridge"]