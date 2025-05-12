// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IReentrancyGuard
 * @dev Interface for the reentrancy guard
 */
interface IReentrancyGuard {
    /**
     * @dev Custom error for reentrancy protection
     */
    error ReentrancyGuard();
}
