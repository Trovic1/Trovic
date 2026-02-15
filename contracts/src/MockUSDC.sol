// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockUSDC
/// @notice Minimal mintable ERC20 used to simulate USDC in local tests and demos.
contract MockUSDC {
    /// @notice Token name.
    string public constant name = "Mock USDC";
    /// @notice Token symbol.
    string public constant symbol = "mUSDC";

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    /// @notice Returns the fixed decimal precision used by USDC-like assets.
    /// @return The decimals count (6).
    function decimals() external pure returns (uint8) {
        return 6;
    }

    /// @notice Approves a spender to transfer caller funds up to `amount`.
    /// @param spender The address allowed to spend caller tokens.
    /// @param amount The maximum allowance.
    /// @return True when approval succeeds.
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /// @notice Transfers tokens from caller to `to`.
    /// @param to The recipient account.
    /// @param amount The token amount.
    /// @return True when transfer succeeds.
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    /// @notice Transfers tokens from `from` to `to` using allowance.
    /// @param from The token owner.
    /// @param to The recipient account.
    /// @param amount The token amount.
    /// @return True when transfer succeeds.
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            require(allowed >= amount, "ERC20: insufficient allowance");
            allowance[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    /// @notice Mints tokens to an arbitrary address for testing/demo setup.
    /// @param to The recipient of freshly minted tokens.
    /// @param amount The token amount to mint.
    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    /// @notice Internal token movement primitive with balance checks.
    /// @param from The source account.
    /// @param to The destination account.
    /// @param amount The token amount.
    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "ERC20: transfer to zero");
        uint256 fromBal = balanceOf[from];
        require(fromBal >= amount, "ERC20: insufficient balance");
        balanceOf[from] = fromBal - amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
