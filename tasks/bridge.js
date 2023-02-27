const CHAIN_IDS = require("../constants/chainIds.json")
const NATIVE_OFT_ARGS = require("../constants/nativeOftArgs.json")

module.exports = async function (taskArgs, hre) {
    const signers = await ethers.getSigners()
    const owner = signers[0]
    const dstChainId = CHAIN_IDS[taskArgs.targetNetwork]    
    const amount = ethers.utils.parseEther(taskArgs.amount)
    const nativeOft = await ethers.getContract(NATIVE_OFT_ARGS[hre.network.name].contractName)
    const bridge = await ethers.getContract("SwappableBridge")
    const nativeFee = (await nativeOft.estimateSendFee(dstChainId, owner.address, amount, false, "0x")).nativeFee
    const increasedNativeFee = nativeFee.mul(5).div(4) // 20% increase
    const gasPrice = await hre.ethers.provider.getGasPrice()
    const finalGasPrice = gasPrice.mul(2)

    const tx = await bridge.bridge(amount, dstChainId, owner.address, owner.address, ethers.constants.AddressZero, "0x", { value: amount.add(increasedNativeFee), gasPrice: finalGasPrice })
    console.log(`bridge tx: ${tx.hash}\n`)
    await tx.wait()
}