// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@layerzerolabs/solidity-examples/contracts/token/oft/v2/IOFTV2.sol";

interface INativeOFT is IOFTV2 {	
	function deposit() external payable;
}