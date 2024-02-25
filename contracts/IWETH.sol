// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IWETH {
    function deposit() external payable;

    function approve(address spender, uint amount) external returns (bool);
}
