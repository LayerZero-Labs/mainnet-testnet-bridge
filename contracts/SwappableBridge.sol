// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import  "@layerzerolabs/solidity-examples/contracts/token/oft/v2/ICommonOFT.sol";
import  "@layerzerolabs/solidity-examples/contracts/token/oft/v2/IOFTReceiverV2.sol";
import  "@layerzerolabs/solidity-examples/contracts/token/oft/v2/IOFTV2.sol";
import "./token/INativeOFT.sol";

contract SwappableBridge is Ownable, IOFTReceiverV2 {
	IOFTV2 public oft;
	INativeOFT public nativeOft;
	IUniswapV2Router02 public uniswapRouter;
	mapping(uint16 => bytes32) public remoteBridges;

	uint8 public constant PT_BRIDGE_AND_SWAP = 0;

	constructor(address _oft, address _nativeOft, address _uniswapRouter) {		
		require(_oft != address(0), "Invalid OFT address");
		require(_nativeOft != address(0), "Invalid Native OFT address");
		require(_uniswapRouter != address(0), "Invalid Uniswap Router address");

		oft = IOFTV2(_oft);
		nativeOft = INativeOFT(_nativeOft);
		uniswapRouter = IUniswapV2Router02(_uniswapRouter);
	}

	function swapAndBridge(uint amountIn, uint amountOutMin, uint16 remoteChainId, ICommonOFT.LzCallParams calldata callParams) external payable {
		require(msg.value > amountIn, "SwappableBridge: not enough value sent");
		
		address[] memory path = new address[](2);
		path[0] = uniswapRouter.WETH();
		path[1] = address(oft);
		
		uint[] memory amounts = uniswapRouter.swapExactETHForTokens{value: amountIn}(amountOutMin, path, address(this), block.timestamp);
		bytes32 bytes32Address = bytes32(uint(uint160(msg.sender)));
		oft.sendFrom{value: msg.value - amountIn}(address(this), remoteChainId, bytes32Address, amounts[1], callParams);
	}

	function bridgeAndSwap(uint amountIn, uint amountOutMin, uint16 remoteChainId, uint64 _dstGasForCall, ICommonOFT.LzCallParams calldata callParams) external payable {
		require(remoteBridges[remoteChainId].length != 0, "SwappableBridge: remote OFT is not set");
		
		nativeOft.deposit{value: amountIn}();
		bytes memory swapParamPayload = abi.encode(PT_BRIDGE_AND_SWAP, msg.sender, amountOutMin);
		
		nativeOft.sendAndCall{value: msg.value - amountIn}(msg.sender, remoteChainId, remoteBridges[remoteChainId], amountIn, swapParamPayload, _dstGasForCall, callParams);
	}

	function setRemoteBridge(uint16 _remoteChainId, bytes32 _remoteBridge) external onlyOwner {
        remoteBridges[_remoteChainId] = _remoteBridge;
    }

	function onOFTReceived(uint16 _srcChainId, bytes calldata, uint64, bytes32 _from, uint _amount, bytes memory _payload) external override {
		require(msg.sender == address(oft), "SwappableBridge: not an OFT");
        require(_from == remoteBridges[_srcChainId], "SwappableBridge: invalid from");

		uint8 pkType;
        assembly {
            pkType := mload(add(_payload, 32))
        }

        if (pkType == PT_BRIDGE_AND_SWAP) {
        	(, address to, uint amountOutMin) = abi.decode(_payload, (uint8, address, uint));

            address[] memory path = new address[](2);		
			path[0] = address(oft);
			path[1] = uniswapRouter.WETH();
			uniswapRouter.swapExactTokensForETH(_amount, amountOutMin, path, to, block.timestamp);
        } 
		else {
            revert("SwappableBridge: payload type");
        }		
	}
}