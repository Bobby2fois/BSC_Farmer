/**
 * BSC Miner Contract Configuration
 */

// BSC Mainnet network configuration
const networkConfig = {
  chainId: 56, // BSC Mainnet
  name: 'BSC Mainnet',
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  }
};

// CornMiner contract configuration
const contractConfig = {
  address: '0xD9bbb27Df553cfC7Ea919009B4Dd9dc357775836',
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
      "name": "marketCorns",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    
    // Main Functions
    {
      "inputs": [{ "internalType": "address", "name": "ref", "type": "address" }],
      "name": "popCorn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "sellCorn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "ref", "type": "address" }],
      "name": "buyCorn",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "openFarm",
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
      "name": "getMyHarvesters",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "_adr", "type": "address" }],
      "name": "getMyCorns",
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
