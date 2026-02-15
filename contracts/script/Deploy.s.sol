// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

import {MockUSDC} from "../src/MockUSDC.sol";
import {CashflowVault} from "../src/CashflowVault.sol";
import {CashflowSchedule} from "../src/CashflowSchedule.sol";
import {CashflowShareNFT} from "../src/CashflowShareNFT.sol";

/// @title DeployCashflowVaults
/// @notice Deployment entrypoint for CashflowVaults MVP contracts.
contract DeployCashflowVaults is Script {
    /// @notice Deploys asset, vault, schedule, and optional receipt NFT.
    /// @return usdc Deployed MockUSDC instance.
    /// @return vault Deployed cashflow vault.
    /// @return schedule Deployed payment schedule.
    /// @return nft Deployed participation receipt NFT.
    function run() external returns (MockUSDC usdc, CashflowVault vault, CashflowSchedule schedule, CashflowShareNFT nft) {
        address creator = vm.envAddress("CREATOR_ADDRESS");
        uint256 cadence = vm.envUint("PAYMENT_CADENCE");
        uint256 amount = vm.envUint("PAYMENT_AMOUNT");
        uint256 start = vm.envUint("START_TIME");

        vm.startBroadcast();
        usdc = new MockUSDC();
        vault = new CashflowVault(usdc);
        schedule = new CashflowSchedule(creator, vault, cadence, amount, start);
        nft = new CashflowShareNFT("Cashflow Receipt", "CFR", address(vault), 1);
        vault.setShareReceiptNft(nft);
        vm.stopBroadcast();
    }
}
