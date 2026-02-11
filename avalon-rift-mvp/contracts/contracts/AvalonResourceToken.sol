// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/// @title Avalon Rift Resource Token
/// @notice ERC20 token minted by the land contract as players claim resources.
contract AvalonResourceToken is ERC20, Ownable2Step {
    error NotMinter();
    error MinterAlreadySet();

    address public minter;

    constructor(address initialOwner) ERC20("Avalon Rift Resource", "ARR") Ownable(initialOwner) {}

    function setMinter(address newMinter) external onlyOwner {
        if (minter != address(0)) revert MinterAlreadySet();
        minter = newMinter;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != minter) revert NotMinter();
        _mint(to, amount);
    }
}
