pragma solidity ^0.6.2; // solhint-disable-line

import "./lib/SafeMath.sol";

contract BakedPizza {
    uint256 public EGGS_TO_HATCH_1MINERS = 864000;
    uint256 PSN = 10000;
    uint256 PSNH = 5000;
    uint256 public marketingFee = 5;
    bool public initialized = false;
    address payable public ceoAddress;
    mapping(address => uint256) public hatcheryMiners;
    mapping(address => uint256) public claimedEggs;
    mapping(address => uint256) public lastHatch;
    mapping(address => address) public referrals;
    uint256 public marketEggs;

    constructor() public {
        ceoAddress = payable(msg.sender);
    }

    function rebakePizza(address ref) public {
        require(initialized);
        if (ref == msg.sender || ref == address(0) || hatcheryMiners[ref] == 0) {
            ref = ceoAddress;
        }
        if (referrals[msg.sender] == address(0)) {
            referrals[msg.sender] = ref;
        }
        uint256 eggsUsed = getMyEggs(msg.sender);
        uint256 newMiners = SafeMath.div(eggsUsed, EGGS_TO_HATCH_1MINERS);
        hatcheryMiners[msg.sender] = SafeMath.add(hatcheryMiners[msg.sender], newMiners);
        claimedEggs[msg.sender] = 0;
        lastHatch[msg.sender] = now;

        //send referral eggs
        claimedEggs[referrals[msg.sender]] =
            SafeMath.add(claimedEggs[referrals[msg.sender]], SafeMath.div(SafeMath.mul(eggsUsed, 15), 100));

        //boost market to nerf miners hoarding
        marketEggs = SafeMath.add(marketEggs, SafeMath.div(eggsUsed, 5));
    }

    function eatPizza() public {
        require(initialized);
        uint256 hasEggs = getMyEggs(msg.sender);
        uint256 eggValue = calculateEggSell(hasEggs);
        uint256 fee = devFee(eggValue);
        claimedEggs[msg.sender] = 0;
        lastHatch[msg.sender] = now;
        marketEggs = SafeMath.add(marketEggs, hasEggs);
        ceoAddress.transfer(fee);
        msg.sender.transfer(SafeMath.sub(eggValue, fee));
    }

    function bakePizza(address ref) public payable {
        require(initialized);
        uint256 eggsBought = calculateEggBuy(msg.value, SafeMath.sub(address(this).balance, msg.value));
        eggsBought = SafeMath.sub(eggsBought, devFee(eggsBought));
        uint256 fee = devFee(msg.value);
        (bool success,) = payable(ceoAddress).call{value: fee}("");
        require(success, "Transfer failed");
        claimedEggs[msg.sender] = SafeMath.add(claimedEggs[msg.sender], eggsBought);
        rebakePizza(ref);
    }

    //magic trade balancing algorithm
    //@param rt: the amount of ETH the user buys
    //@param rs: the amount of ETH in the ca
    //@param bs: the amount of eggs in the market
    //@return the amount of eggs the user can buy + new market eggs
    //@dev: this function is used to calculate the amount of eggs the user can buy
    // Bonding Curve Mechanism
    function calculateTrade(uint256 rt, uint256 rs, uint256 bs) public view returns (uint256) {
        //(PSN*bs)/(PSNH+((PSN*rs+PSNH*rt)/rt));
        return SafeMath.div(
            SafeMath.mul(PSN, bs),
            SafeMath.add(PSNH, SafeMath.div(SafeMath.add(SafeMath.mul(PSN, rs), SafeMath.mul(PSNH, rt)), rt))
        );
    }

    function calculateEggSell(uint256 eggs) public view returns (uint256) {
        return calculateTrade(eggs, marketEggs, address(this).balance);
    }

    function calculateEggBuy(uint256 eth, uint256 contractBalance) public view returns (uint256) {
        return calculateTrade(eth, contractBalance, marketEggs);
    }

    function calculateEggBuySimple(uint256 eth) public view returns (uint256) {
        return calculateEggBuy(eth, address(this).balance);
    }

    function devFee(uint256 amount) public pure returns (uint256) {
        return SafeMath.div(SafeMath.mul(amount, 5), 100);
    }

    function openKitchen() public payable {
        require(msg.sender == ceoAddress, "invalid call");
        require(marketEggs == 0);
        initialized = true;
        marketEggs = 86400000000;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getMyMiners(address _adr) public view returns (uint256) {
        return hatcheryMiners[_adr];
    }

    function getMyEggs(address _adr) public view returns (uint256) {
        return SafeMath.add(claimedEggs[_adr], getEggsSinceLastHatch(_adr));
    }

    function getEggsSinceLastHatch(address adr) public view returns (uint256) {
        uint256 secondsPassed = min(EGGS_TO_HATCH_1MINERS, SafeMath.sub(now, lastHatch[adr]));
        return SafeMath.mul(secondsPassed, hatcheryMiners[adr]);
    }

    function min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }

    receive() external payable {}

    fallback() external payable {}
}
