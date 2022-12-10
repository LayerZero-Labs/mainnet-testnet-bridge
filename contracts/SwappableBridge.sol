// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/v2/ICommonOFT.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/v2/IOFTV2.sol";

contract SwappableBridge {
	IOFTV2 public oft;
	IUniswapV2Router02 public uniswapRouter;

	constructor(address _oft, address _uniswapRouter) {		
		require(_oft != address(0), "SwappableBridge: invalid OFT address");
		require(_uniswapRouter != address(0), "SwappableBridge: invalid Uniswap Router address");

		oft = IOFTV2(_oft);
		uniswapRouter = IUniswapV2Router02(_uniswapRouter);
	}

	function swapAndBridge(uint amountIn, uint amountOutMin, uint16 dstChainId, ICommonOFT.LzCallParams calldata callParams) external payable {
		require(msg.value > amountIn, "SwappableBridge: not enough value sent");
		
		address[] memory path = new address[](2);
		path[0] = uniswapRouter.WETH();
		path[1] = address(oft);
		
		uint[] memory amounts = uniswapRouter.swapExactETHForTokens{value: amountIn}(amountOutMin, path, address(this), block.timestamp);
		bytes32 bytes32Address = bytes32(uint(uint160(msg.sender)));
		oft.sendFrom{value: msg.value - amountIn}(address(this), dstChainId, bytes32Address, amounts[1], callParams);
	}
}