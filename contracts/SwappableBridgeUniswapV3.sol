// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/IOFTCore.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./INativeOFT.sol";

contract SwappableBridgeUniswapV3 {    
    uint24 public constant poolFee = 3000; // 0.3%

    INativeOFT public immutable nativeOft;
    IUniversalRouter public immutable universalRouter;
    address public immutable weth;
	IOFTCore public immutable oft;

    constructor(address _weth, address _oft, address _nativeOft, address _universalRouter) {
        require(_weth != address(0), "SwappableBridge: invalid WETH address");
        require(_oft != address(0), "SwappableBridge: invalid OFT address");
        require(_nativeOft != address(0), "SwappableBridge: invalid Native OFT address");
        require(_universalRouter != address(0), "SwappableBridge: invalid Universal Router address");

        weth = _weth;
        oft = IOFTCore(_oft);
        nativeOft = INativeOFT(_nativeOft);
        universalRouter = IUniversalRouter(_universalRouter);
    }

    function swapAndBridge(uint amountIn, uint amountOutMin, uint16 dstChainId, address to, address payable refundAddress, address zroPaymentAddress, bytes calldata adapterParams) external payable {
        require(to != address(0), "SwappableBridge: invalid to address");
        require(msg.value >= amountIn, "SwappableBridge: not enough value sent");

        // 1) commands
        // 0x0b == WRAP_ETH ... https://docs.uniswap.org/contracts/universal-router/technical-reference#wrap_eth
        // 0x00 == V3_SWAP_EXACT_IN... https://docs.uniswap.org/contracts/universal-router/technical-reference#v3_swap_exact_in
        bytes memory commands = hex"0b00";

        // 2) inputs
        bytes[] memory inputs = new bytes[](2);
        // For weth deposit
        inputs[0] = abi.encode(
            address(universalRouter), // recipient
            amountIn // amount
        );
        // For token swap
        inputs[1] = abi.encode(
            address(this), // recipient
            amountIn, // amount input
            amountOutMin, // min amount output
            // pathway(inputToken, poolFee, outputToken)
            abi.encodePacked(weth, poolFee, address(oft)),
            false
        );

        // 3) deadline
        uint256 deadline = block.timestamp;

        // Call execute on the universal Router
        universalRouter.execute{value: amountIn}(commands, inputs, deadline);

        // check balance after to see how many tokens we received
        uint256 amountReceived = IERC20(address(oft)).balanceOf(address(this));
        // redundant check to ensure we received enough tokens
        require(amountReceived >= amountOutMin, "SwappableBridge: insufficient amount received");

        oft.sendFrom{value: msg.value - amountIn}(
            address(this),
            dstChainId,
            abi.encodePacked(to),
            amountReceived,
            refundAddress,
            zroPaymentAddress,
            adapterParams
        );
    }

    function bridge(uint amountIn, uint16 dstChainId, address to, address payable refundAddress, address zroPaymentAddress, bytes calldata adapterParams) external payable {
        require(to != address(0), "SwappableBridge: invalid to address");
        require(msg.value >= amountIn, "SwappableBridge: not enough value sent");

        nativeOft.deposit{value: amountIn}();
        nativeOft.sendFrom{value: msg.value - amountIn}(address(this), dstChainId, abi.encodePacked(to), amountIn, refundAddress, zroPaymentAddress, adapterParams);
    }
}