const ROUTERS = require("../constants/uniswapRoutes.json")
const UniswapV2Router02Json = require("../test/abi/UniswapV2Router02.json")
const OFT_ARGS = require("../constants/oftArgs.json")

module.exports = async function (taskArgs, hre) {
    const signers = await ethers.getSigners()
    const owner = signers[0]
    const uniswapRouter = new ethers.Contract(ROUTERS[hre.network.name], UniswapV2Router02Json.abi, owner)
    const weth = await uniswapRouter.WETH()
    const oft = await ethers.getContract(OFT_ARGS[hre.network.name].contractName)

    let oftAmount = ethers.utils.parseEther(taskArgs.tokenAmount)
    let ethAmount = ethers.utils.parseEther(taskArgs.ethAmount)

    const gasPrice = await hre.ethers.provider.getGasPrice()
    const finalGasPrice = gasPrice.mul(5).div(4)

    let tx = await oft.approve(uniswapRouter.address, oftAmount, { gasPrice: finalGasPrice })
    console.log(`Approve tx: ${tx.hash}`)
    await tx.wait()

    const blockNumber = await ethers.provider.getBlockNumber()
    const block = await ethers.provider.getBlock(blockNumber)
    const deadline = block.timestamp + 5 * 60 // 5 minutes from the current time

    tx = await uniswapRouter.addLiquidityETH(oft.address, oftAmount, oftAmount, ethAmount, owner.address, deadline, { value: ethAmount, gasPrice: finalGasPrice })
    console.log(`Add liquidity tx: ${tx.hash}`)
    await tx.wait()
}