// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MockUSDC} from "./MockUSDC.sol";

interface ICashflowShareNFT {
    function mintReceipt(address to) external;
}

/// @title CashflowVault
/// @notice ERC-4626 style vault over MockUSDC for tokenized future cashflow participation.
/// @dev The vault issues fungible share tokens and supports deposit/mint/withdraw/redeem flows.
contract CashflowVault {
    /// @notice Vault share token metadata name.
    string public constant name = "Cashflow Vault Share";
    /// @notice Vault share token metadata symbol.
    string public constant symbol = "cvSHARE";

    MockUSDC public immutable asset;
    ICashflowShareNFT public shareReceiptNft;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;

    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(
        address indexed caller,
        address indexed receiver,
        address indexed owner,
        uint256 assets,
        uint256 shares
    );
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
    event ShareReceiptNftUpdated(address indexed nft);

    /// @notice Initializes the vault with the underlying MockUSDC asset.
    /// @param _asset The ERC20 asset backing shares.
    constructor(MockUSDC _asset) {
        asset = _asset;
    }

    /// @notice Returns share token decimal precision aligned with the underlying token.
    /// @return The number of decimals (6).
    function decimals() external pure returns (uint8) {
        return 6;
    }

    /// @notice Returns underlying asset token address.
    /// @return The asset token contract address.
    function assetAddress() external view returns (address) {
        return address(asset);
    }

    /// @notice Sets the optional ERC721 receipt minter used for storytelling UX.
    /// @param nft The NFT contract address.
    function setShareReceiptNft(ICashflowShareNFT nft) external {
        shareReceiptNft = nft;
        emit ShareReceiptNftUpdated(address(nft));
    }

    /// @notice Returns total underlying assets currently held by the vault.
    /// @return The MockUSDC amount in vault custody.
    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    /// @notice Converts assets to shares using ERC-4626 style ratio math (round down).
    /// @param assets Amount of underlying assets.
    /// @return shares Equivalent shares.
    function convertToShares(uint256 assets) public view returns (uint256 shares) {
        uint256 supply = totalSupply;
        uint256 managedAssets = totalAssets();
        if (supply == 0 || managedAssets == 0) return assets;
        return (assets * supply) / managedAssets;
    }

    /// @notice Converts shares to assets using ERC-4626 style ratio math (round down).
    /// @param shares Amount of vault shares.
    /// @return assets Equivalent underlying assets.
    function convertToAssets(uint256 shares) public view returns (uint256 assets) {
        uint256 supply = totalSupply;
        uint256 managedAssets = totalAssets();
        if (supply == 0 || managedAssets == 0) return shares;
        return (shares * managedAssets) / supply;
    }

    /// @notice Preview shares minted for a deposit amount.
    /// @param assets Amount of underlying assets.
    /// @return shares Shares expected to be minted.
    function previewDeposit(uint256 assets) external view returns (uint256 shares) {
        return convertToShares(assets);
    }

    /// @notice Preview assets required to mint a target share amount.
    /// @param shares Desired number of shares.
    /// @return assets Assets required, rounded up.
    function previewMint(uint256 shares) public view returns (uint256 assets) {
        uint256 supply = totalSupply;
        uint256 managedAssets = totalAssets();
        if (supply == 0 || managedAssets == 0) return shares;
        return _mulDivUp(shares, managedAssets, supply);
    }

    /// @notice Preview shares burned for a target asset withdrawal.
    /// @param assets Desired assets to withdraw.
    /// @return shares Shares required, rounded up.
    function previewWithdraw(uint256 assets) public view returns (uint256 shares) {
        uint256 supply = totalSupply;
        uint256 managedAssets = totalAssets();
        if (supply == 0 || managedAssets == 0) return assets;
        return _mulDivUp(assets, supply, managedAssets);
    }

    /// @notice Preview assets returned for a share redemption.
    /// @param shares Shares to redeem.
    /// @return assets Assets expected to be returned.
    function previewRedeem(uint256 shares) external view returns (uint256 assets) {
        return convertToAssets(shares);
    }

    /// @notice Maximum assets `owner` can deposit.
    /// @param owner The account that would receive shares.
    /// @return maxAssets The max deposit amount.
    function maxDeposit(address owner) external pure returns (uint256 maxAssets) {
        owner;
        return type(uint256).max;
    }

    /// @notice Maximum shares `owner` can mint.
    /// @param owner The account that would receive shares.
    /// @return maxShares The max mint amount.
    function maxMint(address owner) external pure returns (uint256 maxShares) {
        owner;
        return type(uint256).max;
    }

    /// @notice Maximum assets withdrawable by `owner`.
    /// @param owner Share holder account.
    /// @return maxAssets The max withdraw amount in assets.
    function maxWithdraw(address owner) external view returns (uint256 maxAssets) {
        return convertToAssets(balanceOf[owner]);
    }

    /// @notice Maximum shares redeemable by `owner`.
    /// @param owner Share holder account.
    /// @return maxShares The max share redemption.
    function maxRedeem(address owner) external view returns (uint256 maxShares) {
        return balanceOf[owner];
    }

    /// @notice Deposits assets and mints proportional shares to `receiver`.
    /// @param assets Asset amount transferred into vault.
    /// @param receiver Account receiving new shares.
    /// @return shares Number of shares minted.
    function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
        require(assets > 0, "ZERO_ASSETS");
        shares = convertToShares(assets);
        require(shares > 0, "ZERO_SHARES");

        require(asset.transferFrom(msg.sender, address(this), assets), "ASSET_TRANSFER_FAILED");
        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /// @notice Mints exact shares to `receiver` by pulling required assets from caller.
    /// @param shares Share amount to mint.
    /// @param receiver Account receiving new shares.
    /// @return assets Required assets transferred in.
    function mint(uint256 shares, address receiver) external returns (uint256 assets) {
        require(shares > 0, "ZERO_SHARES");
        assets = previewMint(shares);
        require(assets > 0, "ZERO_ASSETS");

        require(asset.transferFrom(msg.sender, address(this), assets), "ASSET_TRANSFER_FAILED");
        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /// @notice Withdraws exact assets to `receiver` by burning owner's shares.
    /// @param assets Asset amount to send out.
    /// @param receiver Recipient of underlying assets.
    /// @param owner Share owner whose balance is burned.
    /// @return shares Shares burned.
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares) {
        require(assets > 0, "ZERO_ASSETS");
        shares = previewWithdraw(assets);
        _spendAllowanceIfNeeded(owner, shares);
        _burn(owner, shares);

        require(asset.transfer(receiver, assets), "ASSET_TRANSFER_FAILED");
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /// @notice Redeems exact shares from owner for proportional assets.
    /// @param shares Share amount to burn.
    /// @param receiver Recipient of underlying assets.
    /// @param owner Share owner whose balance is burned.
    /// @return assets Assets returned.
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets) {
        require(shares > 0, "ZERO_SHARES");
        assets = convertToAssets(shares);
        require(assets > 0, "ZERO_ASSETS");
        _spendAllowanceIfNeeded(owner, shares);
        _burn(owner, shares);

        require(asset.transfer(receiver, assets), "ASSET_TRANSFER_FAILED");
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /// @notice Approves `spender` to transfer caller shares.
    /// @param spender Approved address.
    /// @param amount Allowance amount.
    /// @return True when approval succeeds.
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /// @notice Transfers shares from caller to `to`.
    /// @param to Recipient of shares.
    /// @param amount Shares to transfer.
    /// @return True when transfer succeeds.
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    /// @notice Transfers shares from `from` to `to` using share allowance.
    /// @param from Share owner.
    /// @param to Recipient.
    /// @param amount Shares to transfer.
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

    /// @notice Internal share minting helper.
    /// @param to Recipient.
    /// @param amount Minted share amount.
    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "ERC20: mint to zero");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
        if (address(shareReceiptNft) != address(0)) {
            shareReceiptNft.mintReceipt(to);
        }
    }

    /// @notice Internal share burn helper.
    /// @param from Account to burn from.
    /// @param amount Burn amount.
    function _burn(address from, uint256 amount) internal {
        uint256 fromBal = balanceOf[from];
        require(fromBal >= amount, "ERC20: burn exceeds balance");
        balanceOf[from] = fromBal - amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    /// @notice Internal share transfer helper.
    /// @param from Sender.
    /// @param to Recipient.
    /// @param amount Share amount.
    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "ERC20: transfer to zero");
        uint256 fromBal = balanceOf[from];
        require(fromBal >= amount, "ERC20: insufficient balance");
        balanceOf[from] = fromBal - amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    /// @notice Spends share allowance when caller is not owner.
    /// @param owner Share owner.
    /// @param shares Shares requested for burn.
    function _spendAllowanceIfNeeded(address owner, uint256 shares) internal {
        if (msg.sender == owner) return;
        uint256 allowed = allowance[owner][msg.sender];
        if (allowed != type(uint256).max) {
            require(allowed >= shares, "ERC20: insufficient allowance");
            allowance[owner][msg.sender] = allowed - shares;
        }
    }

    /// @notice Computes ceil(x*y/denominator) for preview functions.
    /// @param x Left operand.
    /// @param y Right operand.
    /// @param denominator Divisor.
    /// @return result Ceil division multiplication result.
    function _mulDivUp(uint256 x, uint256 y, uint256 denominator) internal pure returns (uint256 result) {
        result = (x * y) / denominator;
        if ((x * y) % denominator != 0) {
            result += 1;
        }
    }
}
