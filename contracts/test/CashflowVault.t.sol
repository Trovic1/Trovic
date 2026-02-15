// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

import {MockUSDC} from "../src/MockUSDC.sol";
import {CashflowVault} from "../src/CashflowVault.sol";
import {CashflowSchedule} from "../src/CashflowSchedule.sol";
import {CashflowShareNFT} from "../src/CashflowShareNFT.sol";

contract CashflowVaultTest is Test {
    MockUSDC internal usdc;
    CashflowVault internal vault;
    CashflowSchedule internal schedule;
    CashflowShareNFT internal receipt;

    address internal creator = address(0xC0FFEE);
    address internal investorA = address(0xA11CE);
    address internal investorB = address(0xB0B);

    uint256 internal constant ONE_USDC = 1e6;
    uint256 internal constant WEEK = 7 days;

    function setUp() public {
        usdc = new MockUSDC();
        vault = new CashflowVault(usdc);
        schedule = new CashflowSchedule(creator, vault, WEEK, 100 * ONE_USDC, block.timestamp + 1 days);
        receipt = new CashflowShareNFT("Cashflow Receipt", "CFR", address(vault), 1);
        vault.setShareReceiptNft(receipt);

        usdc.mint(investorA, 5_000 * ONE_USDC);
        usdc.mint(investorB, 5_000 * ONE_USDC);
        usdc.mint(creator, 5_000 * ONE_USDC);

        vm.prank(investorA);
        usdc.approve(address(vault), type(uint256).max);
        vm.prank(investorB);
        usdc.approve(address(vault), type(uint256).max);
        vm.prank(creator);
        usdc.approve(address(schedule), type(uint256).max);
    }

    function testDepositAndShares() public {
        vm.prank(investorA);
        uint256 sharesA = vault.deposit(1_000 * ONE_USDC, investorA);
        vm.prank(investorB);
        uint256 sharesB = vault.deposit(500 * ONE_USDC, investorB);

        assertEq(sharesA, 1_000 * ONE_USDC);
        assertEq(sharesB, 500 * ONE_USDC);
        assertEq(vault.balanceOf(investorA), 1_000 * ONE_USDC);
        assertEq(vault.balanceOf(investorB), 500 * ONE_USDC);
        assertEq(receipt.balanceOf(investorA), 1);
        assertEq(receipt.balanceOf(investorB), 1);
    }

    function testCashflowPaymentIncreasesPPS() public {
        vm.prank(investorA);
        vault.deposit(1_000 * ONE_USDC, investorA);

        uint256 ppsBefore = (vault.totalAssets() * 1e18) / vault.totalSupply();

        vm.warp(block.timestamp + 1 days);
        schedule.pay();

        uint256 ppsAfter = (vault.totalAssets() * 1e18) / vault.totalSupply();
        assertGt(ppsAfter, ppsBefore);
    }

    function testRedeemAfterPayments() public {
        vm.prank(investorA);
        vault.deposit(1_000 * ONE_USDC, investorA);

        vm.warp(block.timestamp + 1 days);
        schedule.pay();
        vm.warp(block.timestamp + WEEK);
        schedule.pay();

        uint256 shares = vault.balanceOf(investorA);
        uint256 balBefore = usdc.balanceOf(investorA);

        vm.prank(investorA);
        uint256 assetsOut = vault.redeem(shares, investorA, investorA);

        uint256 balAfter = usdc.balanceOf(investorA);
        assertEq(balAfter - balBefore, assetsOut);
        assertGt(assetsOut, 1_000 * ONE_USDC);
    }

    function testEdgeCases() public {
        vm.expectRevert("ZERO_PAYMENT");
        new CashflowSchedule(creator, vault, WEEK, 0, block.timestamp + 1 days);

        vm.prank(creator);
        schedule.pause();
        vm.warp(block.timestamp + 1 days);
        vm.expectRevert("NOT_ACTIVE");
        schedule.pay();

        CashflowSchedule futureSchedule =
            new CashflowSchedule(creator, vault, WEEK, 10 * ONE_USDC, block.timestamp + 10 days);
        vm.prank(creator);
        usdc.approve(address(futureSchedule), type(uint256).max);
        vm.expectRevert("NOT_STARTED");
        futureSchedule.pay();

        CashflowSchedule allowanceSchedule =
            new CashflowSchedule(creator, vault, WEEK, 10 * ONE_USDC, block.timestamp);
        vm.prank(creator);
        usdc.approve(address(allowanceSchedule), 0);
        vm.expectRevert("ERC20: insufficient allowance");
        allowanceSchedule.pay();
    }
}
