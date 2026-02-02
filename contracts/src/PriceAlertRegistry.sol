// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PriceAlertRegistry {
    struct Alert {
        address owner;
        string symbol;
        uint256 targetPriceUsd;
        bool isAbove;
        uint256 createdAt;
        bool active;
    }

    Alert[] public alerts;

    event AlertCreated(
        uint256 indexed alertId,
        address indexed owner,
        string symbol,
        uint256 targetPriceUsd,
        bool isAbove
    );
    event AlertDeactivated(uint256 indexed alertId, address indexed owner);

    function createAlert(
        string memory symbol,
        uint256 targetPriceUsd,
        bool isAbove
    ) external {
        Alert memory alert = Alert({
            owner: msg.sender,
            symbol: symbol,
            targetPriceUsd: targetPriceUsd,
            isAbove: isAbove,
            createdAt: block.timestamp,
            active: true
        });

        alerts.push(alert);
        emit AlertCreated(
            alerts.length - 1,
            msg.sender,
            symbol,
            targetPriceUsd,
            isAbove
        );
    }

    function deactivateAlert(uint256 alertId) external {
        require(alertId < alerts.length, "Alert does not exist");
        Alert storage alert = alerts[alertId];
        require(alert.owner == msg.sender, "Not alert owner");
        require(alert.active, "Alert already inactive");
        alert.active = false;
        emit AlertDeactivated(alertId, msg.sender);
    }

    function getAlertsByOwner(address owner) external view returns (Alert[] memory) {
        uint256 count;
        for (uint256 i = 0; i < alerts.length; i++) {
            if (alerts[i].owner == owner) {
                count++;
            }
        }

        Alert[] memory ownerAlerts = new Alert[](count);
        uint256 index;
        for (uint256 i = 0; i < alerts.length; i++) {
            if (alerts[i].owner == owner) {
                ownerAlerts[index] = alerts[i];
                index++;
            }
        }
        return ownerAlerts;
    }
}
