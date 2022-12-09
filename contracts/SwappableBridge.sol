// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/v2/ICommonOFT.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/v2/IOFTReceiverV2.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/v2/IOFTV2.sol";
import "./token/INativeOFT.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SwappableBridge is Ownable, IOFTReceiverV2 {
	IOFTV2 public oft;
	INativeOFT public nativeOft;
	IUniswapV2Router02 public uniswapRouter;
	mapping(uint16 => bytes32) public dstBridges;

	constructor(address _oft, address _nativeOft, address _uniswapRouter) {		
		require(_oft != address(0), "Invalid OFT address");
		require(_nativeOft != address(0), "Invalid Native OFT address");
		require(_uniswapRouter != address(0), "Invalid Uniswap Router address");

		oft = IOFTV2(_oft);
		nativeOft = INativeOFT(_nativeOft);
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

	function bridgeAndSwap(uint amountIn, uint amountOutMin, uint16 dstChainId, uint64 dstGasForCall, ICommonOFT.LzCallParams calldata callParams) external payable {
		require(dstBridges[dstChainId].length != 0, "SwappableBridge: remote OFT is not set");
		
		nativeOft.deposit{value: amountIn}();

		bytes memory swapParamPayload = abi.encode(msg.sender, amountOutMin);
		nativeOft.sendAndCall{value: msg.value - amountIn}(address(this), dstChainId, dstBridges[dstChainId], amountIn, swapParamPayload, dstGasForCall, callParams);
	}

	function setDstBridge(uint16 dstChainId, bytes32 dstBridge) external onlyOwner {
        dstBridges[dstChainId] = dstBridge;
    }

	function onOFTReceived(uint16 _srcChainId, bytes calldata, uint64, bytes32 _from, uint _amount, bytes memory _payload) external override {
		require(msg.sender == address(oft), "SwappableBridge: not an OFT");
        require(_from == dstBridges[_srcChainId], "SwappableBridge: invalid from");

		(address to, uint amountOutMin) = abi.decode(_payload, (address, uint));
			
		address[] memory path = new address[](2);		
		path[0] = address(oft);
		path[1] = uniswapRouter.WETH();
			
		IERC20(address(oft)).approve(address(uniswapRouter), _amount);
		uniswapRouter.swapExactTokensForETH(_amount, amountOutMin, path, to, block.timestamp);
	}
}