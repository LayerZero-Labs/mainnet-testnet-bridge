const ROUTERS = require("../constants/uniswapRoutes.json")
const POOLS = require("../constants/pools.json")
const UniswapV2Router02Json = require("../test/abi/UniswapV2Router02.json")
const erc20AbiJson = require("../test/abi/IERC20.json")

module.exports = async function (taskArgs, hre) {
    const signers = await ethers.getSigners()
    const owner = signers[0]
    const uniswapRouter = new ethers.Contract(ROUTERS[hre.network.name], UniswapV2Router02Json.abi, owner)
    const lp = new ethers.Contract(POOLS[hre.network.name], erc20AbiJson.abi, owner)
    const lpBalance = await lp.balanceOf(owner.address)
    console.log(`[${hre.network.name}] LP balance ${lpBalance.toString()}`)

    const blockNumber = await ethers.provider.getBlockNumber()
    const block = await ethers.provider.getBlock(blockNumber)
    const deadline = block.timestamp + 5 * 60; // 5 minutes from the current time
    const gasPrice = await hre.ethers.provider.getGasPrice()
    const finalGasPrice = gasPrice.mul(5).div(4)

    let tx = await lp.approve(uniswapRouter.address, lpBalance, { gasPrice: finalGasPrice })
    console.log(`[${hre.network.name}] approve LP tx ${tx.hash}`)
    await tx.wait()

    tx = await uniswapRouter.removeLiquidityETH(oft.address, lpBalance, "0", "0", owner.address, deadline, { gasPrice: finalGasPrice })
    console.log(`[${hre.network.name}] remove liquidity tx: ${tx.hash}`)
    await tx.wait()
}