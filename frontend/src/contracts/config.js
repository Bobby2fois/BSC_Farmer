/**
 * BSC Miner Contract Configuration
 */

// BSC Testnet network configuration
const networkConfig = {
  chainId: 97, // BSC Testnet
  name: 'BSC Testnet',
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com/'],
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  }
};

// BakedPizza contract configuration
const contractConfig = {
  address: '0xde38d419D2028041E1674607bBB4D80e64E91eAF',
  abi: [
    // Constructor
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    
    // State Variables
    {
      "inputs": [],
      "name": "EGGS_TO_HATCH_1MINERS",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "marketingFee",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "initialized",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ceoAddress",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "marketEggs",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    
    // Main Functions
    {
      "inputs": [{ "internalType": "address", "name": "ref", "type": "address" }],
      "name": "rebakePizza",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "eatPizza",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "ref", "type": "address" }],
      "name": "bakePizza",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "openKitchen",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    
    // View Functions
    {
      "inputs": [],
      "name": "getBalance",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "_adr", "type": "address" }],
      "name": "getMyMiners",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "_adr", "type": "address" }],
      "name": "getMyEggs",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "adr", "type": "address" }],
      "name": "getEggsSinceLastHatch",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "eggs", "type": "uint256" }],
      "name": "calculateEggSell",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "eth", "type": "uint256" }],
      "name": "calculateEggBuySimple",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "eth", "type": "uint256" },
        { "internalType": "uint256", "name": "contractBalance", "type": "uint256" }
      ],
      "name": "calculateEggBuy",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
      "name": "devFee",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    
    // Mapping accessors
    {
      "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "name": "hatcheryMiners",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "name": "claimedEggs",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "name": "lastHatch",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "name": "referrals",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    
    // Compatibility with previous ABI
    {
      "inputs": [{ "internalType": "address", "name": "adr", "type": "address" }],
      "name": "getChefs",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyEggs",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pizzaRewards",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "rebakePizza",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "sellPizza",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
};

// Export as a single statement to avoid duplicate export errors
export { networkConfig, contractConfig };
