// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@layerzerolabs/solidity-examples/contracts/token/oft/OFT.sol";

contract MinSendAmountOFT is OFT {
    uint public minSendAmount;

    constructor(string memory _name, string memory _symbol, address _lzEndpoint, uint _minSendAmount) OFT(_name, _symbol, _lzEndpoint) {
        minSendAmount = _minSendAmount;
    }

    function setMinSendAmount(uint _minSendAmount) external onlyOwner {
        minSendAmount = _minSendAmount;
    }

    function _send(address _from, uint16 _dstChainId, bytes memory _toAddress, uint _amount, address payable _refundAddress, address _zroPaymentAddress, bytes memory _adapterParams) internal virtual override {
        require(_amount >= minSendAmount, "MinSendAmountOFT: amount is less than minimum");
        super._send(_from, _dstChainId, _toAddress, _amount, _refundAddress, _zroPaymentAddress, _adapterParams);
    }
}