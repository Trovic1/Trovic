// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PriceAlertRegistry.sol";

contract PriceAlertRegistryTest is Test {
    PriceAlertRegistry private registry;
    address private owner = address(0x123);
    address private other = address(0x456);

    function setUp() public {
        registry = new PriceAlertRegistry();
    }

    function testCreateAlertStoresDataAndEmitsEvent() public {
        vm.prank(owner);
        vm.expectEmit(true, true, false, true);
        emit PriceAlertRegistry.AlertCreated(0, owner, "AVAX", 5000, true);
        registry.createAlert("AVAX", 5000, true);

        (
            address storedOwner,
            string memory symbol,
            uint256 targetPriceUsd,
            bool isAbove,
            uint256 createdAt,
            bool active
        ) = registry.alerts(0);

        assertEq(storedOwner, owner);
        assertEq(symbol, "AVAX");
        assertEq(targetPriceUsd, 5000);
        assertTrue(isAbove);
        assertTrue(createdAt > 0);
        assertTrue(active);
    }

    function testDeactivateAlertUpdatesStateAndEmitsEvent() public {
        vm.prank(owner);
        registry.createAlert("AVAX", 6000, false);

        vm.prank(owner);
        vm.expectEmit(true, true, false, true);
        emit PriceAlertRegistry.AlertDeactivated(0, owner);
        registry.deactivateAlert(0);

        (, , , , , bool active) = registry.alerts(0);
        assertFalse(active);
    }

    function testOnlyOwnerCanDeactivate() public {
        vm.prank(owner);
        registry.createAlert("AVAX", 7000, true);

        vm.prank(other);
        vm.expectRevert("Not alert owner");
        registry.deactivateAlert(0);
    }
}
