// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./libraries/SafeMath.sol";
import "./interfaces/IReentrancyGuard.sol";

/**
 * @title BakedPizza
 * @dev A yield farming contract on Binance Smart Chain with a pizza/baker theme
 * @custom:security-contact security@bakedpizza.example.com
 */
contract BakedPizza is IReentrancyGuard {
    using SafeMath for uint256;

    // Constants
    uint256 public constant EGGS_TO_HATCH_1MINERS = 864000;
    uint256 private constant PSN = 10000;
    uint256 private constant PSNH = 5000;
    
    // State variables
    uint256 public marketingFee = 5;
    bool public initialized = false;
    address payable public ceoAddress;
    
    // Mappings
    mapping(address => uint256) public hatcheryMiners;
    mapping(address => uint256) public claimedEggs;
    mapping(address => uint256) public lastHatch;
    mapping(address => address) public referrals;
    
    // Market state
    uint256 public marketEggs;
    
    // Reentrancy guard
    bool private _notEntered = true;
    
    // Events
    event RebakePizza(address indexed user, address indexed referrer, uint256 minersBought);
    event EatPizza(address indexed user, uint256 eggsSold, uint256 bnbReceived);
    event BakePizza(address indexed user, address indexed referrer, uint256 bnbSpent, uint256 eggsReceived);
    event KitchenOpened(address indexed owner, uint256 initialEggs);
    
    // Custom errors
    error NotInitialized();
    error AlreadyInitialized();
    error OnlyOwner();
    error TransferFailed();
    error ReentrancyGuard();

    /**
     * @dev Constructor sets the CEO address to the deployer
     */
    constructor() {
        ceoAddress = payable(msg.sender);
    }
    
    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     */
    modifier nonReentrant() {
        if (!_notEntered) revert ReentrancyGuard();
        _notEntered = false;
        _;
        _notEntered = true;
    }
    
    /**
     * @dev Ensures the contract has been initialized
     */
    modifier whenInitialized() {
        if (!initialized) revert NotInitialized();
        _;
    }
    
    /**
     * @dev Restricts function to contract owner
     */
    modifier onlyOwner() {
        if (msg.sender != ceoAddress) revert OnlyOwner();
        _;
    }

    /**
     * @dev Reinvests eggs to get more miners
     * @param ref The referrer address
     */
    function rebakePizza(address ref) public whenInitialized {
        // Validate and set referrer
        if (ref == msg.sender || ref == address(0) || hatcheryMiners[ref] == 0) {
            ref = ceoAddress;
        }
        
        if (referrals[msg.sender] == address(0)) {
            referrals[msg.sender] = ref;
        }
        
        // Calculate eggs and new miners
        uint256 eggsUsed = getMyEggs(msg.sender);
        uint256 newMiners = eggsUsed.div(EGGS_TO_HATCH_1MINERS);
        
        // Update user data
        hatcheryMiners[msg.sender] = hatcheryMiners[msg.sender].add(newMiners);
        claimedEggs[msg.sender] = 0;
        lastHatch[msg.sender] = block.timestamp;

        // Send referral eggs (15%)
        claimedEggs[referrals[msg.sender]] = claimedEggs[referrals[msg.sender]].add(
            eggsUsed.mul(15).div(100)
        );

        // Boost market to nerf miners hoarding (20%)
        marketEggs = marketEggs.add(eggsUsed.div(5));
        
        emit RebakePizza(msg.sender, ref, newMiners);
    }

    /**
     * @dev Sells eggs for BNB
     */
    function eatPizza() public nonReentrant whenInitialized {
        uint256 hasEggs = getMyEggs(msg.sender);
        uint256 eggValue = calculateEggSell(hasEggs);
        uint256 fee = devFee(eggValue);
        
        // Reset user's eggs and update last hatch time
        claimedEggs[msg.sender] = 0;
        lastHatch[msg.sender] = block.timestamp;
        
        // Add eggs to market
        marketEggs = marketEggs.add(hasEggs);
        
        // Transfer fee to CEO
        (bool success1,) = ceoAddress.call{value: fee}("");
        if (!success1) revert TransferFailed();
        
        // Transfer remaining BNB to user
        (bool success2,) = payable(msg.sender).call{value: eggValue.sub(fee)}("");
        if (!success2) revert TransferFailed();
        
        emit EatPizza(msg.sender, hasEggs, eggValue.sub(fee));
    }

    /**
     * @dev Buys eggs with BNB
     * @param ref The referrer address
     */
    function bakePizza(address ref) public payable nonReentrant whenInitialized {
        // Calculate eggs bought and fee
        uint256 eggsBought = calculateEggBuy(msg.value, address(this).balance.sub(msg.value));
        eggsBought = eggsBought.sub(devFee(eggsBought));
        uint256 fee = devFee(msg.value);
        
        // Transfer fee to CEO
        (bool success,) = ceoAddress.call{value: fee}("");
        if (!success) revert TransferFailed();
        
        // Add eggs to user's balance
        claimedEggs[msg.sender] = claimedEggs[msg.sender].add(eggsBought);
        
        emit BakePizza(msg.sender, ref, msg.value, eggsBought);
        
        // Reinvest to get miners
        rebakePizza(ref);
    }

    /**
     * @dev Calculates trade based on bonding curve mechanism
     * @param rt Amount of BNB the user buys
     * @param rs Amount of BNB in the contract
     * @param bs Amount of eggs in the market
     * @return The amount of eggs the user can buy + new market eggs
     */
    function calculateTrade(uint256 rt, uint256 rs, uint256 bs) public pure returns (uint256) {
        return bs.mul(PSN).div(
            PSNH.add(rs.mul(PSN).add(rt.mul(PSNH)).div(rt))
        );
    }

    /**
     * @dev Calculates the BNB value of eggs
     * @param eggs Amount of eggs
     * @return BNB value
     */
    function calculateEggSell(uint256 eggs) public view returns (uint256) {
        return calculateTrade(eggs, marketEggs, address(this).balance);
    }

    /**
     * @dev Calculates eggs bought with a given amount of BNB
     * @param eth Amount of BNB
     * @param contractBalance Contract balance
     * @return Amount of eggs
     */
    function calculateEggBuy(uint256 eth, uint256 contractBalance) public view returns (uint256) {
        return calculateTrade(eth, contractBalance, marketEggs);
    }

    /**
     * @dev Simplified version of calculateEggBuy
     * @param eth Amount of BNB
     * @return Amount of eggs
     */
    function calculateEggBuySimple(uint256 eth) public view returns (uint256) {
        return calculateEggBuy(eth, address(this).balance);
    }

    /**
     * @dev Calculates the marketing/dev fee
     * @param amount Amount to calculate fee from
     * @return Fee amount
     */
    function devFee(uint256 amount) public view returns (uint256) {
        return amount.mul(marketingFee).div(100);
    }

    /**
     * @dev Initializes the contract - can only be called once
     */
    function openKitchen() public payable onlyOwner {
        if (initialized) revert AlreadyInitialized();
        if (marketEggs != 0) revert AlreadyInitialized();
        
        initialized = true;
        marketEggs = 86400000000;
        
        emit KitchenOpened(msg.sender, marketEggs);
    }

    /**
     * @dev Returns contract balance
     * @return BNB balance
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Gets miners owned by address
     * @param _adr User address
     * @return Number of miners
     */
    function getMyMiners(address _adr) public view returns (uint256) {
        return hatcheryMiners[_adr];
    }

    /**
     * @dev Gets total eggs owned by address
     * @param _adr User address
     * @return Total eggs
     */
    function getMyEggs(address _adr) public view returns (uint256) {
        return claimedEggs[_adr].add(getEggsSinceLastHatch(_adr));
    }

    /**
     * @dev Calculates eggs produced since last hatch
     * @param adr User address
     * @return Number of eggs
     */
    function getEggsSinceLastHatch(address adr) public view returns (uint256) {
        uint256 secondsPassed = min(EGGS_TO_HATCH_1MINERS, block.timestamp.sub(lastHatch[adr]));
        return secondsPassed.mul(hatcheryMiners[adr]);
    }

    /**
     * @dev Returns the minimum of two numbers
     * @param a First number
     * @param b Second number
     * @return The smaller of the two numbers
     */
    function min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Function to receive BNB
     */
    receive() external payable {}

    /**
     * @dev Fallback function
     */
    fallback() external payable {}
}
