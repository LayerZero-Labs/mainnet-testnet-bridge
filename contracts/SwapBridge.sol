// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/extension/NativeOFT.sol";

contract SwapBridge {
	NativeOFT public nativeOFT;
	IUniswapV2Router02 public uniswapRouter;
	uint16 public remoteChainId;

	constructor(address payable _nativeOFT, address _uniswapRouter, uint16 _remoteChainId) {		
		require(_nativeOFT != address(0), "Invalid nativeOFT address");
		require(_uniswapRouter != address(0), "Invalid uniswapRouter address");

		nativeOFT = NativeOFT(_nativeOFT);
		uniswapRouter = IUniswapV2Router02(_uniswapRouter);
		remoteChainId = _remoteChainId;
	}

	function swapAndBridge(uint amountIn, uint amountOutMin, address payable refundAddress, address zroPaymentAddress, bytes memory adapterParams) external payable {
		require(msg.value > amountIn, "Not enough value sent");
		
		address[] memory path = new address[](2);
		path[0] = uniswapRouter.WETH();
		path[1] = address(nativeOFT);
		
		uint[] memory amounts = uniswapRouter.swapExactETHForTokens{value: amountIn}(amountOutMin, path, msg.sender, block.timestamp);
		
		nativeOFT.sendFrom{value: msg.value - amountIn}(msg.sender, remoteChainId, abi.encode(msg.sender), amounts[1], refundAddress, zroPaymentAddress, adapterParams);
	}
}