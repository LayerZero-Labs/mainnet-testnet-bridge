task("setTrustedRemote", "sets trusted remotes for OFT and NativeOFT", require("./setTrustedRemote"))
    .addParam("targetNetwork", "the destination chainId")

task("bridge", "bridges native tokens", require("./bridge"))
    .addParam("targetNetwork", "the destination chainId")
    .addParam("amount", "amount to bridge")

task("addLiquidity", "adds Liquidity", require("./addLiquidity"))
    .addParam("tokenAmount", "token amount to add")
    .addParam("ethAmount", "ETH amount to add")

task("swapAndBridge", "swaps and bridge", require("./swapAndBridge"))
    .addParam("targetNetwork", "the destination chainId")
    .addParam("amount", "amount to swap")

task("getPrice", "info", require("./getPrice"))

task("info", "info", require("./info"))

task("getSigners", "show the signers of the current mnemonic", require("./getSigners"))
    .addOptionalParam("n", "how many to show", 3, types.int)