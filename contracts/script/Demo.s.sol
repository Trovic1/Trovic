// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";

import {MockUSDC} from "../src/MockUSDC.sol";
import {CashflowVault} from "../src/CashflowVault.sol";
import {CashflowSchedule} from "../src/CashflowSchedule.sol";

/// @title DemoCashflowVaults
/// @notice Scripted local demo: mint USDC -> deposit -> creator pays twice -> investor redeems.
contract DemoCashflowVaults is Script {
    /// @notice Executes the scripted MVP flow against freshly deployed contracts.
    function run() external {
        uint256 creatorPk = vm.envUint("CREATOR_PK");
        uint256 investorPk = vm.envUint("INVESTOR_PK");

        address creator = vm.addr(creatorPk);
        address investor = vm.addr(investorPk);

        vm.startBroadcast(creatorPk);
        MockUSDC usdc = new MockUSDC();
        CashflowVault vault = new CashflowVault(usdc);
        CashflowSchedule schedule = new CashflowSchedule(creator, vault, 7 days, 100e6, block.timestamp);
        usdc.mint(creator, 10_000e6);
        usdc.approve(address(schedule), type(uint256).max);
        vm.stopBroadcast();

        vm.startBroadcast(investorPk);
        usdc.mint(investor, 1_000e6);
        usdc.approve(address(vault), type(uint256).max);
        vault.deposit(1_000e6, investor);
        vm.stopBroadcast();

        vm.startBroadcast(creatorPk);
        schedule.pay();
        vm.warp(block.timestamp + 7 days);
        schedule.pay();
        vm.stopBroadcast();

        vm.startBroadcast(investorPk);
        uint256 shares = vault.balanceOf(investor);
        vault.redeem(shares, investor, investor);
        vm.stopBroadcast();
    }
}
