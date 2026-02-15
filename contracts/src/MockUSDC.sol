// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockUSDC
/// @notice Minimal ERC20 token with 6 decimals used to simulate USDC in local tests and demos.
contract MockUSDC {
    /// @notice Emitted when tokens are transferred.
    event Transfer(address indexed from, address indexed to, uint256 value);
    /// @notice Emitted when an owner updates an allowance for a spender.
    event Approval(address indexed owner, address indexed spender, uint256 value);

    string public constant name = "Mock USD Coin";
    string public constant symbol = "mUSDC";
    uint8 public constant decimals = 6;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    /// @notice Mints new tokens to a target account.
    /// @param to Account that receives newly minted tokens.
    /// @param amount Number of tokens to mint in 6-decimal units.
    function mint(address to, uint256 amount) external {
        require(to != address(0), "ZERO_ADDRESS");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    /// @notice Transfers tokens from the caller to another account.
    /// @param to Recipient account.
    /// @param amount Number of tokens to transfer.
    /// @return True when the transfer succeeds.
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    /// @notice Sets the allowance for a spender.
    /// @param spender Approved spender.
    /// @param amount New allowance amount.
    /// @return True when the approval succeeds.
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /// @notice Transfers tokens from one account to another using allowance.
    /// @param from Account that provides tokens.
    /// @param to Recipient account.
    /// @param amount Number of tokens to transfer.
    /// @return True when the transfer succeeds.
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            require(allowed >= amount, "INSUFFICIENT_ALLOWANCE");
            allowance[from][msg.sender] = allowed - amount;
            emit Approval(from, msg.sender, allowance[from][msg.sender]);
        }

        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "ZERO_ADDRESS");
        require(balanceOf[from] >= amount, "INSUFFICIENT_BALANCE");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
