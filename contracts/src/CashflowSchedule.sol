// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { CashflowVault } from "./CashflowVault.sol";

/// @title CashflowSchedule
/// @notice Manages a simulated cashflow agreement where a creator periodically pays into a vault.
contract CashflowSchedule {
    /// @notice Lifecycle status for the agreement.
    enum State {
        ACTIVE,
        PAUSED,
        ENDED
    }

    /// @notice Emitted when a payment is executed.
    event PaymentExecuted(address indexed creator, uint256 indexed paymentTime, uint256 amount);
    /// @notice Emitted when schedule state changes.
    event StateChanged(State indexed newState);

    address public immutable creator;
    CashflowVault public immutable vault;
    uint256 public immutable cadence;
    uint256 public immutable paymentAmount;
    uint256 public immutable startTime;

    State public state;
    uint256 public lastPaymentTime;

    /// @notice Creates a new cashflow schedule.
    /// @param creator_ Address responsible for periodic payments.
    /// @param vault_ Vault receiving cashflow payments.
    /// @param cadence_ Minimum seconds between payments.
    /// @param paymentAmount_ Amount paid each successful `pay()` call.
    /// @param startTime_ Earliest timestamp when the first payment is allowed.
    constructor(
        address creator_,
        address vault_,
        uint256 cadence_,
        uint256 paymentAmount_,
        uint256 startTime_
    ) {
        require(creator_ != address(0), "ZERO_CREATOR");
        require(vault_ != address(0), "ZERO_VAULT");
        require(cadence_ > 0, "ZERO_CADENCE");
        require(paymentAmount_ > 0, "ZERO_PAYMENT");

        creator = creator_;
        vault = CashflowVault(vault_);
        cadence = cadence_;
        paymentAmount = paymentAmount_;
        startTime = startTime_;
        state = State.ACTIVE;
    }

    /// @notice Pays one cadence period's cashflow into the vault.
    /// @dev Caller can be any address, but funds are always transferred from the creator account.
    ///      The creator must pre-approve the vault to spend `paymentAmount` per payment.
    function pay() external {
        require(state == State.ACTIVE, "NOT_ACTIVE");
        require(block.timestamp >= startTime, "NOT_STARTED");

        uint256 nextAllowed = lastPaymentTime == 0 ? startTime : lastPaymentTime + cadence;
        require(block.timestamp >= nextAllowed, "TOO_EARLY");

        lastPaymentTime = block.timestamp;
        vault.recordCashflowPayment(creator, paymentAmount);
        emit PaymentExecuted(creator, block.timestamp, paymentAmount);
    }

    /// @notice Pauses new payments.
    function pause() external onlyCreator {
        require(state == State.ACTIVE, "INVALID_STATE");
        state = State.PAUSED;
        emit StateChanged(state);
    }

    /// @notice Resumes payments after a pause.
    function resume() external onlyCreator {
        require(state == State.PAUSED, "INVALID_STATE");
        state = State.ACTIVE;
        emit StateChanged(state);
    }

    /// @notice Permanently ends the schedule.
    function end() external onlyCreator {
        require(state != State.ENDED, "ALREADY_ENDED");
        state = State.ENDED;
        emit StateChanged(state);
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "ONLY_CREATOR");
        _;
    }
}
