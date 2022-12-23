// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../MinSendAmountOFT.sol";

contract MintableMinSendAmountOFTMock is MinSendAmountOFT {
    constructor(string memory _name, string memory _symbol, address _layerZeroEndpoint, uint _minSendAmount) MinSendAmountOFT(_name, _symbol, _layerZeroEndpoint, _minSendAmount) {}

    function mint(address _to, uint _amount) public {
        _mint(_to, _amount);
    }
}