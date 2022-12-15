const CHAIN_IDS = require("../constants/chainIds.json")

module.exports = async function (taskArgs, hre) {
	const signers = await ethers.getSigners()
	const owner = signers[0]
	const dstChainId = CHAIN_IDS[taskArgs.targetNetwork]
	const amount = ethers.utils.parseEther(taskArgs.amount);
	const oft = await ethers.getContract("OFT");
	const bridge = await ethers.getContract("SwappableBridge");

	const nativeFee = (await oft.estimateSendFee(dstChainId, owner.address, amount, false, "0x")).nativeFee;
	const increasedNativeFee = nativeFee.mul(5).div(4); // 20% increase

	let tx = (await bridge.swapAndBridge(amount, "0", dstChainId, owner.address, ethers.constants.AddressZero, "0x", { value: amount.add(increasedNativeFee) })).wait()
	console.log(tx.transactionHash)
}