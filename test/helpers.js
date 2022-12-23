const { ethers } = require("hardhat")

const UniswapV2PairJson = require("./abi/UniswapV2Pair.json")
const UniswapV2FactoryJson = require("./abi/UniswapV2Factory.json")
const UniswapV2Router02Json = require("./abi/UniswapV2Router02.json")

exports.createUniswap = async function (owner, weth) {
    const factory = await new ethers.ContractFactory(UniswapV2FactoryJson.abi, UniswapV2FactoryJson.bytecode, owner).deploy(owner.address)
    const router = await new ethers.ContractFactory(UniswapV2Router02Json.abi, UniswapV2Router02Json.bytecode, owner).deploy(factory.address, weth.address)

    return {
        factory,
        router,
        pairFor: (address) => new ethers.Contract(address, UniswapV2PairJson.abi, owner)
    }
}