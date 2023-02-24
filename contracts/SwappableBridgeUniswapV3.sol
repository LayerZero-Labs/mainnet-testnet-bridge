// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/IOFTCore.sol";
import "./IWETH.sol";
import "./INativeOFT.sol";

contract SwappableBridgeUniswapV3 {    
    uint24 public constant poolFee = 3000; // 0.3%

    IWETH public immutable weth;
	IOFTCore public immutable oft;
    ISwapRouter public immutable swapRouter;

    constructor(address _weth, address _oft, address _swapRouter) {
        require(_weth != address(0), "SwappableBridge: invalid WETH address");
        require(_oft != address(0), "SwappableBridge: invalid OFT address");
        require(_swapRouter != address(0), "SwappableBridge: invalid Swap Router address");

        weth = IWETH(_weth);
        oft = IOFTCore(_oft);
        swapRouter = ISwapRouter(_swapRouter);
    }

    function swapAndBridge(uint amountIn, uint amountOutMin, uint16 dstChainId, address to, address payable refundAddress, address zroPaymentAddress, bytes calldata adapterParams) external payable {
        require(to != address(0), "SwappableBridge: invalid to address");
        require(msg.value >= amountIn, "SwappableBridge: not enough value sent");

        weth.deposit{value: amountIn}();
        weth.approve(address(swapRouter), amountIn);

        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(weth),
                tokenOut: address(oft),
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: amountOutMin,
                sqrtPriceLimitX96: 0
            });

        uint amountOut = swapRouter.exactInputSingle(params);
        oft.sendFrom{value: msg.value - amountIn}(address(this), dstChainId, abi.encodePacked(to), amountOut, refundAddress, zroPaymentAddress, adapterParams);
    }
}