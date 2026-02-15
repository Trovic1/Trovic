// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MockUSDC} from "./MockUSDC.sol";

/// @title CashflowVault
/// @notice Lightweight ERC-4626 style vault over MockUSDC for hackathon use.
/// @dev Creator cashflow payments increase assets without minting new shares, raising PPS for investors.
contract CashflowVault {
    /// @notice Emitted when assets are deposited and shares are minted.
    event Deposit(address indexed caller, address indexed receiver, uint256 assets, uint256 shares);
    /// @notice Emitted when shares are burned and assets are withdrawn.
    event Withdraw(
        address indexed caller,
        address indexed receiver,
        address indexed owner,
        uint256 assets,
        uint256 shares
    );
    /// @notice Emitted when the schedule pushes a cashflow payment to the vault.
    event CashflowPaymentRecorded(address indexed payer, uint256 assets);
    /// @notice Emitted when allowances are updated.
    event Approval(address indexed owner, address indexed spender, uint256 value);
    /// @notice Emitted when vault shares transfer between users.
    event Transfer(address indexed from, address indexed to, uint256 value);

    string public constant name = "Cashflow Vault Share";
    string public constant symbol = "CVSHARE";
    uint8 public constant decimals = 6;

    MockUSDC public immutable asset;
    address public schedule;
    address public immutable admin;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    /// @notice Creates a new vault bound to one USDC asset token and one schedule contract.
    /// @param asset_ Underlying asset token accepted by the vault.
    constructor(address asset_) {
        require(asset_ != address(0), "ZERO_ASSET");
        asset = MockUSDC(asset_);
        admin = msg.sender;
    }

    /// @notice Sets the cashflow schedule allowed to record payments.
    /// @param schedule_ Schedule contract address.
    function setSchedule(address schedule_) external {
        require(msg.sender == admin, "ONLY_ADMIN");
        require(schedule == address(0), "SCHEDULE_ALREADY_SET");
        require(schedule_ != address(0), "ZERO_SCHEDULE");
        schedule = schedule_;
    }

    /// @notice Returns the amount of underlying assets held by the vault.
    /// @return Current MockUSDC balance owned by this vault.
    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    /// @notice Converts assets to shares using ERC-4626 floor-rounding semantics.
    /// @param assets Amount of underlying assets.
    /// @return shares Equivalent share amount.
    function convertToShares(uint256 assets) public view returns (uint256 shares) {
        uint256 supply = totalSupply;
        return supply == 0 ? assets : (assets * supply) / totalAssets();
    }

    /// @notice Converts shares to assets using ERC-4626 floor-rounding semantics.
    /// @param shares Amount of vault shares.
    /// @return assets Equivalent underlying asset amount.
    function convertToAssets(uint256 shares) public view returns (uint256 assets) {
        uint256 supply = totalSupply;
        return supply == 0 ? shares : (shares * totalAssets()) / supply;
    }

    /// @notice Estimates shares minted for a deposit.
    /// @param assets Underlying assets to deposit.
    /// @return shares Expected shares.
    function previewDeposit(uint256 assets) external view returns (uint256 shares) {
        return convertToShares(assets);
    }

    /// @notice Estimates required assets to mint an exact amount of shares.
    /// @param shares Shares the user wants minted.
    /// @return assets Required assets using ceil rounding.
    function previewMint(uint256 shares) public view returns (uint256 assets) {
        uint256 supply = totalSupply;
        if (supply == 0) return shares;
        uint256 managedAssets = totalAssets();
        return (shares * managedAssets + supply - 1) / supply;
    }

    /// @notice Estimates required shares to withdraw exact assets.
    /// @param assets Asset amount desired.
    /// @return shares Shares to burn using ceil rounding.
    function previewWithdraw(uint256 assets) public view returns (uint256 shares) {
        uint256 supply = totalSupply;
        if (supply == 0) return assets;
        uint256 managedAssets = totalAssets();
        return (assets * supply + managedAssets - 1) / managedAssets;
    }

    /// @notice Estimates assets returned by redeeming shares.
    /// @param shares Shares being redeemed.
    /// @return assets Underlying assets returned.
    function previewRedeem(uint256 shares) external view returns (uint256 assets) {
        return convertToAssets(shares);
    }

    /// @notice Deposits assets and mints shares to the receiver.
    /// @param assets Assets to transfer into the vault.
    /// @param receiver Share recipient.
    /// @return shares Amount of shares minted.
    function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
        require(assets > 0, "ZERO_ASSETS");
        shares = convertToShares(assets);
        require(shares > 0, "ZERO_SHARES");
        _mint(receiver, shares);
        require(asset.transferFrom(msg.sender, address(this), assets), "TRANSFER_FAILED");
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /// @notice Mints exact shares to a receiver by pulling required assets.
    /// @param shares Shares to mint.
    /// @param receiver Share recipient.
    /// @return assets Assets spent by caller.
    function mint(uint256 shares, address receiver) external returns (uint256 assets) {
        require(shares > 0, "ZERO_SHARES");
        assets = previewMint(shares);
        _mint(receiver, shares);
        require(asset.transferFrom(msg.sender, address(this), assets), "TRANSFER_FAILED");
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /// @notice Withdraws exact assets to receiver by burning owner shares.
    /// @param assets Assets to withdraw.
    /// @param receiver Recipient of assets.
    /// @param owner Owner whose shares are burned.
    /// @return shares Shares burned.
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares) {
        require(assets > 0, "ZERO_ASSETS");
        shares = previewWithdraw(assets);
        _spendAllowanceIfNeeded(owner, msg.sender, shares);
        _burn(owner, shares);
        require(asset.transfer(receiver, assets), "TRANSFER_FAILED");
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /// @notice Redeems exact shares for underlying assets.
    /// @param shares Shares to redeem.
    /// @param receiver Recipient of assets.
    /// @param owner Owner whose shares are burned.
    /// @return assets Assets returned.
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets) {
        require(shares > 0, "ZERO_SHARES");
        assets = convertToAssets(shares);
        _spendAllowanceIfNeeded(owner, msg.sender, shares);
        _burn(owner, shares);
        require(asset.transfer(receiver, assets), "TRANSFER_FAILED");
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /// @notice Records a creator cashflow payment without minting shares.
    /// @dev We intentionally avoid `deposit(...)` here because deposit mints new shares and would dilute existing investors.
    ///      The business intent is that creator payments increase vault assets per share (PPS), so this function only transfers assets.
    /// @param payer Address paying the scheduled cashflow.
    /// @param assets Amount of assets paid into the vault.
    function recordCashflowPayment(address payer, uint256 assets) external {
        require(msg.sender == schedule && schedule != address(0), "ONLY_SCHEDULE");
        require(assets > 0, "ZERO_ASSETS");
        require(asset.transferFrom(payer, address(this), assets), "TRANSFER_FAILED");
        emit CashflowPaymentRecorded(payer, assets);
    }

    /// @notice Sets an allowance for vault share transfers.
    /// @param spender Approved spender.
    /// @param amount Allowance amount.
    /// @return True when approval succeeds.
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /// @notice Transfers shares from caller to receiver.
    /// @param to Receiver of shares.
    /// @param amount Shares to transfer.
    /// @return True when transfer succeeds.
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    /// @notice Transfers shares using allowance.
    /// @param from Share owner.
    /// @param to Receiver.
    /// @param amount Shares to transfer.
    /// @return True when transfer succeeds.
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        _spendAllowanceIfNeeded(from, msg.sender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function _spendAllowanceIfNeeded(address owner, address spender, uint256 amount) internal {
        if (owner == spender) return;
        uint256 allowed = allowance[owner][spender];
        if (allowed != type(uint256).max) {
            require(allowed >= amount, "INSUFFICIENT_ALLOWANCE");
            allowance[owner][spender] = allowed - amount;
            emit Approval(owner, spender, allowance[owner][spender]);
        }
    }

    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "ZERO_RECEIVER");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal {
        require(balanceOf[from] >= amount, "INSUFFICIENT_SHARES");
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "ZERO_RECEIVER");
        require(balanceOf[from] >= amount, "INSUFFICIENT_SHARES");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
