// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@layerzerolabs/solidity-examples/contracts/token/oft/IOFTCore.sol";

interface INativeOFT is IOFTCore {
    function deposit() external payable;
}