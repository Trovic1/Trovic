// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {CashflowVault} from "../src/CashflowVault.sol";
import {CashflowSchedule} from "../src/CashflowSchedule.sol";

contract CashflowVaultTest is Test {
    MockUSDC internal usdc;
    CashflowVault internal vault;
    CashflowSchedule internal schedule;

    address internal creator = address(0xCAFE);
    address internal investorA = address(0xA11CE);
    address internal investorB = address(0xB0B);

    uint256 internal constant INITIAL_DEPOSIT = 1_000e6;
    uint256 internal constant PERIOD_PAYMENT = 100e6;
    uint256 internal start;

    function setUp() public {
        start = block.timestamp + 1 days;

        usdc = new MockUSDC();
        vault = new CashflowVault(address(usdc));
        schedule = new CashflowSchedule(creator, address(vault), 7 days, PERIOD_PAYMENT, start);
        vault.setSchedule(address(schedule));

        usdc.mint(investorA, 10_000e6);
        usdc.mint(investorB, 10_000e6);
        usdc.mint(creator, 10_000e6);

        vm.prank(investorA);
        usdc.approve(address(vault), type(uint256).max);

        vm.prank(investorB);
        usdc.approve(address(vault), type(uint256).max);

        vm.prank(creator);
        usdc.approve(address(vault), type(uint256).max);
    }

    function testDepositAndShares() public {
        vm.prank(investorA);
        uint256 mintedA = vault.deposit(INITIAL_DEPOSIT, investorA);

        vm.prank(investorB);
        uint256 mintedB = vault.deposit(INITIAL_DEPOSIT, investorB);

        assertEq(mintedA, INITIAL_DEPOSIT);
        assertEq(mintedB, INITIAL_DEPOSIT);
        assertEq(vault.balanceOf(investorA), INITIAL_DEPOSIT);
        assertEq(vault.balanceOf(investorB), INITIAL_DEPOSIT);
        assertEq(vault.totalAssets(), 2_000e6);
        assertEq(vault.totalSupply(), 2_000e6);
    }

    function testCashflowPaymentIncreasesPPS() public {
        vm.prank(investorA);
        vault.deposit(INITIAL_DEPOSIT, investorA);

        uint256 ppsBefore = _pps();

        vm.warp(start);
        schedule.pay();

        uint256 ppsAfter = _pps();
        assertGt(ppsAfter, ppsBefore);
    }

    function testRedeemAfterPayments() public {
        vm.prank(investorA);
        uint256 shares = vault.deposit(INITIAL_DEPOSIT, investorA);

        vm.warp(start);
        schedule.pay();

        vm.warp(start + 7 days);
        schedule.pay();

        uint256 balBefore = usdc.balanceOf(investorA);

        vm.prank(investorA);
        uint256 redeemedAssets = vault.redeem(shares, investorA, investorA);

        uint256 balAfter = usdc.balanceOf(investorA);
        assertEq(balAfter - balBefore, redeemedAssets);
        assertGt(redeemedAssets, INITIAL_DEPOSIT);
    }

    function testEdgeCases() public {
        vm.prank(investorA);
        vault.deposit(INITIAL_DEPOSIT, investorA);

        vm.prank(creator);
        schedule.pause();

        vm.warp(start);
        vm.expectRevert("NOT_ACTIVE");
        schedule.pay();

        vm.prank(creator);
        schedule.resume();

        vm.warp(start - 1);
        vm.expectRevert("NOT_STARTED");
        schedule.pay();

        vm.warp(start);
        vm.expectRevert("ZERO_ASSETS");
        vault.deposit(0, investorA);

        vm.prank(creator);
        usdc.approve(address(vault), 0);

        vm.expectRevert("INSUFFICIENT_ALLOWANCE");
        schedule.pay();

        vm.expectRevert("ZERO_PAYMENT");
        new CashflowSchedule(creator, address(vault), 7 days, 0, start);
    }

    function _pps() internal view returns (uint256) {
        return (vault.totalAssets() * 1e18) / vault.totalSupply();
    }
}
