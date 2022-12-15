// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@layerzerolabs/solidity-examples/contracts/mocks/LZEndpointMock.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/OFT.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/extension/NativeOFT.sol";

contract LayerZeroEndpoint is LZEndpointMock {
	constructor(uint16 _chainId) LZEndpointMock(_chainId) {}
}