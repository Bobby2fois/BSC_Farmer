const { ethers } = require('ethers');

// This script checks the actual function signatures available on the deployed contract
async function main() {
  // Connect to BSC Testnet
  const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
  
  // Your contract address
  const contractAddress = '0xde38d419D2028041E1674607bBB4D80e64E91eAF';
  
  console.log('Checking contract at:', contractAddress);
  
  // Get contract bytecode to confirm it exists
  const code = await provider.getCode(contractAddress);
  console.log('Contract exists:', code !== '0x');
  
  // Create a minimal ABI with all possible function signatures we need to check
  const testAbi = [
    // State variables
    'function initialized() view returns (bool)',
    'function marketEggs() view returns (uint256)',
    'function ceoAddress() view returns (address)',
    
    // Core functions from BakedPizza contract
    'function rebakePizza(address) returns ()',
    'function eatPizza() returns ()',
    'function bakePizza(address) payable returns ()',
    
    // Alternative function names that might be used
    'function hatchEggs(address) returns ()',
    'function sellEggs() returns ()',
    
    // Stats functions
    'function getMyMiners(address) view returns (uint256)',
    'function getMyEggs(address) view returns (uint256)',
    'function calculateEggSell(uint256) view returns (uint256)',
    
    // Direct mapping access
    'function hatcheryMiners(address) view returns (uint256)',
    'function claimedEggs(address) view returns (uint256)',
    'function lastHatch(address) view returns (uint256)',
  ];
  
  // Create contract instance
  const contract = new ethers.Contract(contractAddress, testAbi, provider);
  
  // Test each function to see which ones work
  console.log('\n=== TESTING CONTRACT FUNCTIONS ===');
  
  // Check state variables
  console.log('\n> State Variables:');
  await testFunction(contract, 'initialized');
  await testFunction(contract, 'marketEggs');
  await testFunction(contract, 'ceoAddress');
  
  // Check rebake function alternatives
  console.log('\n> Rebake Function Alternatives:');
  console.log('NOTE: These will fail in read-only mode, but we can check if they exist');
  await testFunctionExists(contract, 'rebakePizza');
  await testFunctionExists(contract, 'hatchEggs');
  // Other possible names
  await testFunctionExists(contract, 'reinvestEggs');
  await testFunctionExists(contract, 'compound');
  await testFunctionExists(contract, 'reinvest');
  
  // Check sell function alternatives
  console.log('\n> Sell Function Alternatives:'); 
  await testFunctionExists(contract, 'eatPizza');
  await testFunctionExists(contract, 'sellEggs');
  await testFunctionExists(contract, 'sellPizza');
  await testFunctionExists(contract, 'withdraw');
  
  // Check buy function
  console.log('\n> Buy Function:');
  await testFunctionExists(contract, 'bakePizza');
  await testFunctionExists(contract, 'buyEggs');
  await testFunctionExists(contract, 'buyMiners');
  
  // Check stats functions
  console.log('\n> Stats Functions:');
  await testFunction(contract, 'getMyMiners', '0xde38d419D2028041E1674607bBB4D80e64E91eAF');
  await testFunction(contract, 'getMyEggs', '0xde38d419D2028041E1674607bBB4D80e64E91eAF');
  await testFunction(contract, 'calculateEggSell', 1000);
  
  // Check direct access to mappings
  console.log('\n> Direct Mapping Access:');
  await testFunction(contract, 'hatcheryMiners', '0xde38d419D2028041E1674607bBB4D80e64E91eAF');
  await testFunction(contract, 'claimedEggs', '0xde38d419D2028041E1674607bBB4D80e64E91eAF');
  await testFunction(contract, 'lastHatch', '0xde38d419D2028041E1674607bBB4D80e64E91eAF');
}

// Test if a function exists and can be called
async function testFunction(contract, functionName, ...args) {
  try {
    const result = await contract[functionName](...args);
    console.log(`✅ ${functionName}:`, result?.toString ? result.toString() : result);
    return true;
  } catch (e) {
    if (e.message.includes('call revert exception') || 
        e.message.includes('invalid opcode') ||
        e.message.includes('execution reverted')) {
      console.log(`⚠️ ${functionName}: Function exists but call failed: ${e.message.split('\n')[0]}`);
      return true;
    } else {
      console.log(`❌ ${functionName}: Function doesn't exist: ${e.message.split('\n')[0]}`);
      return false;
    }
  }
}

// Test if a function exists in the contract
async function testFunctionExists(contract, functionName) {
  if (typeof contract[functionName] === 'function') {
    console.log(`✅ ${functionName}: Function exists`);
    return true;
  } else {
    console.log(`❌ ${functionName}: Function doesn't exist`);
    return false;
  }
}

main().catch(error => {
  console.error('Error executing script:', error);
  process.exit(1);
});
