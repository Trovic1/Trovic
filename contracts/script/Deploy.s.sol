// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {CashflowVault} from "../src/CashflowVault.sol";
import {CashflowSchedule} from "../src/CashflowSchedule.sol";
import {CashflowShareNFT} from "../src/CashflowShareNFT.sol";

/// @title Deploy
/// @notice Deploys the CashflowVaults MVP contracts.
contract Deploy is Script {
    /// @notice Deploys MockUSDC, vault, schedule, and receipt NFT.
    /// @return usdc Deployed mock token.
    /// @return vault Deployed vault.
    /// @return schedule Deployed schedule.
    /// @return receiptNft Deployed optional receipt NFT.
    function run() external returns (MockUSDC usdc, CashflowVault vault, CashflowSchedule schedule, CashflowShareNFT receiptNft) {
        address creator = vm.envAddress("CREATOR");
        uint256 cadence = vm.envOr("CADENCE", uint256(7 days));
        uint256 paymentAmount = vm.envOr("PAYMENT_AMOUNT", uint256(100e6));
        uint256 startTime = vm.envOr("START_TIME", uint256(block.timestamp + 1 days));

        vm.startBroadcast();
        usdc = new MockUSDC();
        vault = new CashflowVault(address(usdc));
        schedule = new CashflowSchedule(creator, address(vault), cadence, paymentAmount, startTime);
        vault.setSchedule(address(schedule));
        receiptNft = new CashflowShareNFT();
        vm.stopBroadcast();
    }
}
