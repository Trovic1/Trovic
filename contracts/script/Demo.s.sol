// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {CashflowVault} from "../src/CashflowVault.sol";
import {CashflowSchedule} from "../src/CashflowSchedule.sol";

/// @title Demo
/// @notice Runs the demo flow: mint USDC -> investor deposit -> creator pays twice -> investor redeems.
contract Demo is Script {
    /// @notice Executes the end-to-end scripted demo against deployed contracts.
    /// @param usdcAddr Deployed MockUSDC address.
    /// @param vaultAddr Deployed CashflowVault address.
    /// @param scheduleAddr Deployed CashflowSchedule address.
    /// @param investor Investor account used for deposit/redeem.
    /// @param creator Creator account used for scheduled payments.
    function run(
        address usdcAddr,
        address vaultAddr,
        address scheduleAddr,
        address investor,
        address creator
    ) external {
        MockUSDC usdc = MockUSDC(usdcAddr);
        CashflowVault vault = CashflowVault(vaultAddr);
        CashflowSchedule schedule = CashflowSchedule(scheduleAddr);

        uint256 depositAmount = 1_000e6;

        vm.startBroadcast();

        usdc.mint(investor, 2_000e6);
        usdc.mint(creator, 500e6);

        vm.stopBroadcast();

        vm.startBroadcast(investor);
        usdc.approve(vaultAddr, depositAmount);
        uint256 shares = vault.deposit(depositAmount, investor);
        vm.stopBroadcast();

        vm.startBroadcast(creator);
        usdc.approve(vaultAddr, type(uint256).max);
        vm.stopBroadcast();

        vm.startBroadcast(investor);
        vm.warp(schedule.startTime());
        schedule.pay();
        vm.warp(schedule.startTime() + schedule.cadence());
        schedule.pay();

        vault.redeem(shares, investor, investor);
        vm.stopBroadcast();
    }
}
