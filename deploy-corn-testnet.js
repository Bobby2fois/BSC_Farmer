const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying CornMiner to BSC Testnet...');
  
  // Get the contract factory
  const CornMiner = await ethers.getContractFactory('CornMiner');
  
  // Deploy the contract
  const cornMiner = await CornMiner.deploy();
  
  // Wait for deployment to complete
  await cornMiner.deployed();
  
  console.log('CornMiner deployed to:', cornMiner.address);
  
  // Initialize the contract (open the farm)
  console.log('Initializing CornMiner (opening the farm)...');
  
  const tx = await cornMiner.openFarm();
  await tx.wait();
  
  console.log('Farm opened successfully!');
  console.log('-------------------------------------');
  console.log('CornMiner contract details:');
  console.log('Contract Address:', cornMiner.address);
  console.log('Owner/CEO Address:', await cornMiner.ceoAddress());
  console.log('Initialized:', await cornMiner.initialized());
  console.log('Marketing Fee:', (await cornMiner.marketingFee()).toString(), '%');
  console.log('Initial Market Corns:', (await cornMiner.marketCorns()).toString());
  console.log('-------------------------------------');
  console.log('Verify contract on BSC Testnet Explorer:');
  console.log(`npx hardhat verify --network testnet ${cornMiner.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment error:', error);
    process.exit(1);
  });
