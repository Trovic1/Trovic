// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import { MockUSDC } from "../src/MockUSDC.sol";
import { CashflowVault } from "../src/CashflowVault.sol";
import { CashflowSchedule } from "../src/CashflowSchedule.sol";

contract Demo is Script {
    function run() external {
        // Setup private keys for the accounts
        uint256 investorPk = 0x1;
        uint256 creatorPk = 0x2;
        address investor = vm.addr(investorPk);
        address creator = vm.addr(creatorPk);

        vm.startBroadcast();

        // 1. Deploy Contracts
        MockUSDC usdc = new MockUSDC();

        // Vault takes USDC address
        CashflowVault vault = new CashflowVault(address(usdc));

        uint256 cadence = 7 days;
        uint256 paymentAmount = 100e6; // 100 USDC
        uint256 startTime = block.timestamp + 1;

        // Schedule takes Vault address
        CashflowSchedule schedule =
            new CashflowSchedule(creator, address(vault), cadence, paymentAmount, startTime);

        // --- THE FIX 1: Access Control ---
        // Authorize the schedule in the vault
        vault.setSchedule(address(schedule));

        // 2. Fund Accounts
        usdc.mint(investor, 2_000e6);
        usdc.mint(creator, 500e6);

        vm.stopBroadcast();

        // --- Simulated Interactions ---
        console.log("Before deposit - totalAssets:", vault.totalAssets());
        console.log("Before deposit - totalSupply:", vault.totalSupply());

        // 3. Investor Deposit
        vm.startPrank(investor);
        usdc.approve(address(vault), 1_000e6);
        uint256 shares = vault.deposit(1_000e6, investor);
        vm.stopPrank();

        // 4. Creator Payments
        vm.startPrank(creator);
        // --- THE FIX 2: Correct Allowance ---
        // The Vault calls transferFrom, so the Vault needs the allowance
        usdc.approve(address(vault), type(uint256).max);

        // First Payment
        vm.warp(startTime);
        schedule.pay();

        // Second Payment
        vm.warp(startTime + cadence);
        schedule.pay();
        console.log("After payments - totalAssets:", vault.totalAssets());
        console.log("After payments - totalSupply:", vault.totalSupply());

        vm.stopPrank();

        // 5. Redemption
        vm.prank(investor);
        vault.redeem(shares, investor, investor);

        // --- Results ---
        uint256 finalBalance = usdc.balanceOf(investor);
        console.log("Demo completed successfully!");
        console.log("Investor final USDC balance:", finalBalance);
        
        // Investor started with 2000, deposited 1000 (remaining 1000).
        // Two payments of 100 USDC each were added to the vault.
        // Redemption should return 1200 USDC. Total should be 2200.
        if (finalBalance > 2000e6) {
            console.log("Profit Realized:", (finalBalance - 2000e6) / 1e6, "USDC");
        }
    }
}