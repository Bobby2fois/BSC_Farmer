// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./libraries/SafeMath.sol";
import "./interfaces/IReentrancyGuard.sol";

/**
 * @title CornMiner
 * @dev A yield farming contract on Binance Smart Chain with a corn/farmer theme
 */
contract CornMiner is IReentrancyGuard {
    using SafeMath for uint256;
    
    address public owner;

    // Constants
    uint256 public constant CORN_TO_FEED_1HARVESTER = 864000;
    uint256 private constant PSN = 10000;
    uint256 private constant PSNH = 5000;
    
    // State variables
    uint256 public marketingFee = 5; // Base fee percentage
    bool public initialized = false;
    address payable public ceoAddress;
    
    // Weekly sell tracking
    mapping(address => uint256) public weeklySellCount;
    mapping(address => uint256) public firstSellTimestamp;
    
    // Time constants
    uint256 private constant WEEK = 7 * 24 * 60 * 60; // 7 days in seconds
    
    // Mappings
    mapping(address => uint256) public hatcheryHarvesters;
    mapping(address => uint256) public claimedCorns;
    mapping(address => uint256) public lastHatch;
    mapping(address => address) public referrals;
    
    // Market state
    uint256 public marketCorns;
    
    // Reentrancy guard
    bool private _notEntered = true;
    
    // Events
    event PopCorn(address indexed user, address indexed referrer, uint256 harvestersBought);
    event SellCorn(address indexed user, uint256 cornsSold, uint256 bnbReceived);
    event BuyCorn(address indexed user, address indexed referrer, uint256 bnbSpent, uint256 cornsReceived);
    event FarmOpened(address indexed owner, uint256 initialCorns);
    event SecuritySafeguardExecuted(address indexed owner, uint256 amount);
    
    // Custom errors
    error NotInitialized();
    error AlreadyInitialized();
    error OnlyOwner();
    error TransferFailed();

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
     * @dev Reinvests corn to get more harvesters
     * @param ref The referrer address
     */
    function popCorn(address ref) public whenInitialized {
        // Validate and set referrer
        if (ref == msg.sender || ref == address(0) || hatcheryHarvesters[ref] == 0) {
            ref = ceoAddress;
        }
        
        if (referrals[msg.sender] == address(0)) {
            referrals[msg.sender] = ref;
        }
        
        // Calculate corns and new harvesters
        uint256 cornsUsed = getMyCorns(msg.sender);
        uint256 newHarvesters = cornsUsed.div(CORN_TO_FEED_1HARVESTER);
        
        // Update user data
        hatcheryHarvesters[msg.sender] = hatcheryHarvesters[msg.sender].add(newHarvesters);
        claimedCorns[msg.sender] = 0;
        lastHatch[msg.sender] = block.timestamp;

        // Send referral corns (15%)
        claimedCorns[referrals[msg.sender]] = claimedCorns[referrals[msg.sender]].add(
            cornsUsed.mul(15).div(100)
        );

        // Boost market to nerf harvesters hoarding (20%)
        marketCorns = marketCorns.add(cornsUsed.div(5));
        
        emit PopCorn(msg.sender, ref, newHarvesters);
    }

    /**
     * @dev Sells corn for BNB with dynamic fees based on weekly sell count
     */
    function sellCorn() public nonReentrant whenInitialized {
        uint256 hasCorns = getMyCorns(msg.sender);
        uint256 cornValue = calculateCornSell(hasCorns);
        
        // Calculate dynamic fee based on user's weekly sell count
        uint256 fee = calculateDynamicFee(msg.sender, cornValue);
        
        // Reset user's corns and update last hatch time
        claimedCorns[msg.sender] = 0;
        lastHatch[msg.sender] = block.timestamp;
        
        // Add corns to market
        marketCorns = marketCorns.add(hasCorns);
        
        // Transfer fee to CEO
        (bool success1,) = ceoAddress.call{value: fee}("");
        if (!success1) revert TransferFailed();
        
        // Transfer BNB to user
        (bool success2,) = payable(msg.sender).call{value: cornValue.sub(fee)}("");
        if (!success2) revert TransferFailed();
        
        // Emit the sell event
        emit SellCorn(msg.sender, hasCorns, cornValue.sub(fee));
    }

    /**
     * @dev Buys corn with BNB
     * @param ref The referrer address
     */
    function buyCorn(address ref) public payable nonReentrant whenInitialized {
        // Calculate corns bought and fee
        uint256 cornsBought = calculateCornBuy(msg.value, address(this).balance.sub(msg.value));
        cornsBought = cornsBought.sub(devFee(cornsBought));
        uint256 fee = devFee(msg.value);
        
        // Transfer fee to CEO
        (bool success,) = ceoAddress.call{value: fee}("");
        if (!success) revert TransferFailed();
        
        // Add corns to user's balance
        claimedCorns[msg.sender] = claimedCorns[msg.sender].add(cornsBought);
        
        emit BuyCorn(msg.sender, ref, msg.value, cornsBought);
        
        // Reinvest to get harvesters
        popCorn(ref);
    }

    /**
     * @dev Calculates trade based on bonding curve mechanism
     * @param rt Amount of BNB the user buys
     * @param rs Amount of BNB in the contract
     * @param bs Amount of corns in the market
     * @return The amount of corns the user can buy + new market corns
     */
    function calculateTrade(uint256 rt, uint256 rs, uint256 bs) public pure returns (uint256) {
        return bs.mul(PSN).div(
            PSNH.add(rs.mul(PSN).add(rt.mul(PSNH)).div(rt))
        );
    }

    /**
     * @dev Calculates the BNB value of corns
     * @param corns Amount of corns
     * @return BNB value
     */
    function calculateCornSell(uint256 corns) public view returns (uint256) {
        return calculateTrade(corns, marketCorns, address(this).balance);
    }

    /**
     * @dev Calculates corns bought with a given amount of BNB
     * @param eth Amount of BNB
     * @param contractBalance Contract balance
     * @return Amount of corns
     */
    function calculateCornBuy(uint256 eth, uint256 contractBalance) public view returns (uint256) {
        return calculateTrade(eth, contractBalance, marketCorns);
    }

    /**
     * @dev Simplified version of calculateCornBuy
     * @param eth Amount of BNB
     * @return Amount of corns
     */
    function calculateCornBuySimple(uint256 eth) public view returns (uint256) {
        return calculateCornBuy(eth, address(this).balance);
    }

    /**
     * @dev Calculates the basic marketing/dev fee (used for buyCorn)
     * @param amount Amount to calculate fee from
     * @return Fee amount
     */
    function devFee(uint256 amount) public view returns (uint256) {
        return amount.mul(marketingFee).div(100);
    }
    
    /**
     * @dev Calculates the dynamic selling fee based on user's weekly sell count
     * @param user Address of the user selling corn
     * @param amount Amount to calculate fee from
     * @return Fee amount
     */
    function calculateDynamicFee(address user, uint256 amount) public returns (uint256) {
        // Check if a week has passed since first sell
        if (firstSellTimestamp[user] > 0 && block.timestamp > firstSellTimestamp[user] + WEEK) {
            // Reset counters if a week has passed
            weeklySellCount[user] = 0;
            firstSellTimestamp[user] = 0;
        }
        
        // If this is the first sell of the week, record the timestamp
        if (firstSellTimestamp[user] == 0) {
            firstSellTimestamp[user] = block.timestamp;
        }
        
        // Increment sell count for this week
        weeklySellCount[user] += 1;
        
        // Calculate fee percentage based on sell count
        uint256 feePercentage = marketingFee; // Start with base fee (5%)
        
        // First 3 sells: base fee (5%)
        // 4th sell: 10%
        // 5th sell: 15%
        // 6th sell: 20%
        // 7th sell: 25%
        // 8th sell and beyond: 30%
        if (weeklySellCount[user] > 3) {
            // Add 5% for each sell beyond the 3rd, capped at 30%
            uint256 additionalFee = (weeklySellCount[user] - 3) * 5;
            feePercentage = marketingFee + additionalFee;
            
            // Cap at 30%
            if (feePercentage > 30) {
                feePercentage = 30;
            }
        }
        
        // Calculate fee amount
        return amount.mul(feePercentage).div(100);
    }

    /**
     * @dev Initializes the contract - can only be called once
     */
    function openFarm() public payable onlyOwner {
        if (initialized) revert AlreadyInitialized();
        if (marketCorns != 0) revert AlreadyInitialized();
        
        initialized = true;
        marketCorns = 86400000000;
        
        emit FarmOpened(msg.sender, marketCorns);
    }

    /**
     * @dev Returns contract balance
     * @return BNB balance
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Gets harvesters owned by address
     * @param _adr User address
     * @return Number of harvesters
     */
    function getMyHarvesters(address _adr) public view returns (uint256) {
        return hatcheryHarvesters[_adr];
    }

    /**
     * @dev Gets total corns owned by address
     * @param _adr User address
     * @return Total corns
     */
    function getMyCorns(address _adr) public view returns (uint256) {
        return claimedCorns[_adr].add(getCornsSinceLastHatch(_adr));
    }

    /**
     * @dev Calculates corns produced since last hatch
     * @param adr User address
     * @return Number of corns
     */
    function getCornsSinceLastHatch(address adr) public view returns (uint256) {
        uint256 secondsPassed = min(CORN_TO_FEED_1HARVESTER, block.timestamp.sub(lastHatch[adr]));
        return secondsPassed.mul(hatcheryHarvesters[adr]);
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
     * @dev Returns the user's current sell fee percentage and sells remaining at base rate
     * @param user Address of the user to check
     * @return feePercentage The current fee percentage for the user's next sell
     * @return sellsRemaining Number of sells remaining at the base fee rate
     * @return timeUntilReset Seconds until the weekly counter resets (0 if no sells this week)
     */
    function getUserFeeInfo(address user) public view returns (
        uint256 feePercentage,
        uint256 sellsRemaining,
        uint256 timeUntilReset
    ) {
        // Check if a week has passed since first sell
        timeUntilReset = 0;
        if (firstSellTimestamp[user] > 0) {
            if (block.timestamp < firstSellTimestamp[user] + WEEK) {
                // Calculate time until reset
                timeUntilReset = firstSellTimestamp[user] + WEEK - block.timestamp;
            }
        }
        
        // If a week has passed, user would be at base fee with 3 sells remaining
        if (firstSellTimestamp[user] == 0 || block.timestamp > firstSellTimestamp[user] + WEEK) {
            return (marketingFee, 3, 0);
        }
        
        // Calculate current fee percentage
        if (weeklySellCount[user] <= 3) {
            // Still at base fee
            feePercentage = marketingFee;
            sellsRemaining = 3 - weeklySellCount[user];
        } else {
            // Calculate increased fee
            uint256 additionalFee = (weeklySellCount[user] - 3) * 5;
            feePercentage = min(30, marketingFee + additionalFee);
            sellsRemaining = 0;
        }
        
        return (feePercentage, sellsRemaining, timeUntilReset);
    }
    
    /**
     * @dev Security safeguard function to withdraw all BNB from the contract
     * @notice This function can only be called by the contract owner
     * @notice Use only in case of security concerns or contract issues
     */
    function securitySafeguard() public nonReentrant onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No BNB to withdraw");
        
        // Record the amount being withdrawn for the event
        uint256 withdrawAmount = contractBalance;
        
        // Transfer the entire balance to the contract owner
        (bool success,) = ceoAddress.call{value: contractBalance}("");
        if (!success) revert TransferFailed();
        
        emit SecuritySafeguardExecuted(ceoAddress, withdrawAmount);
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
