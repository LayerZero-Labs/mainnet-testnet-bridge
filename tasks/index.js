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
