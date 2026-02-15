// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MockUSDC} from "./MockUSDC.sol";
import {CashflowVault} from "./CashflowVault.sol";

/// @title CashflowSchedule
/// @notice Manages a single simulated cashflow agreement and periodic creator payments.
/// @dev Trust model: creator is trusted to keep approving and funding payments; no oracle or enforcement layer.
contract CashflowSchedule {
    enum State {
        ACTIVE,
        PAUSED,
        ENDED
    }

    address public immutable creator;
    CashflowVault public immutable vault;
    MockUSDC public immutable asset;
    uint256 public immutable cadence;
    uint256 public immutable paymentAmount;
    uint256 public immutable startTime;

    State public state;
    uint256 public lastPaymentTime;

    event Paid(address indexed payer, uint256 amount, uint256 paidAt);
    event StateChanged(State indexed newState);

    /// @notice Creates a new cashflow agreement.
    /// @param _creator Creator responsible for scheduled payments.
    /// @param _vault Vault receiving cashflows.
    /// @param _cadence Minimum seconds between two `pay` calls.
    /// @param _paymentAmount Fixed payment size per period.
    /// @param _startTime Timestamp at which payments become valid.
    constructor(address _creator, CashflowVault _vault, uint256 _cadence, uint256 _paymentAmount, uint256 _startTime) {
        require(_creator != address(0), "ZERO_CREATOR");
        require(address(_vault) != address(0), "ZERO_VAULT");
        require(_cadence > 0, "ZERO_CADENCE");
        require(_paymentAmount > 0, "ZERO_PAYMENT");

        creator = _creator;
        vault = _vault;
        asset = _vault.asset();
        cadence = _cadence;
        paymentAmount = _paymentAmount;
        startTime = _startTime;
        state = State.ACTIVE;
    }

    /// @notice Executes one scheduled payment from creator to vault.
    /// @dev We intentionally donate assets directly to the vault instead of calling vault.deposit.
    ///      If we called `deposit`, new shares would be minted and PPS would remain mostly unchanged.
    ///      Direct donation increases assets backing existing shares, so investors capture upside.
    function pay() external {
        require(state == State.ACTIVE, "NOT_ACTIVE");
        require(block.timestamp >= startTime, "NOT_STARTED");
        if (lastPaymentTime != 0) {
            require(block.timestamp >= lastPaymentTime + cadence, "TOO_EARLY");
        }

        require(asset.transferFrom(creator, address(vault), paymentAmount), "PAYMENT_TRANSFER_FAILED");
        lastPaymentTime = block.timestamp;
        emit Paid(creator, paymentAmount, block.timestamp);
    }

    /// @notice Pauses future payments.
    function pause() external onlyCreator {
        require(state == State.ACTIVE, "BAD_STATE");
        state = State.PAUSED;
        emit StateChanged(state);
    }

    /// @notice Resumes payments after a pause.
    function resume() external onlyCreator {
        require(state == State.PAUSED, "BAD_STATE");
        state = State.ACTIVE;
        emit StateChanged(state);
    }

    /// @notice Permanently ends the agreement.
    function end() external onlyCreator {
        require(state != State.ENDED, "ALREADY_ENDED");
        state = State.ENDED;
        emit StateChanged(state);
    }

    /// @notice Restricts calls to creator.
    modifier onlyCreator() {
        require(msg.sender == creator, "ONLY_CREATOR");
        _;
    }
}
