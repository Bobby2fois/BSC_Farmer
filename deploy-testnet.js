const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying BakedPizza contract to BSC Testnet...");

  // Get the contract factory
  const BakedPizza = await ethers.getContractFactory("BakedPizza");
  
  // Deploy the contract
  const bakedPizza = await BakedPizza.deploy();
  
  // Wait for deployment to be confirmed
  await bakedPizza.deployed();
  
  console.log("BakedPizza deployed to:", bakedPizza.address);
  console.log("Owner address:", (await ethers.getSigners())[0].address);
  console.log("");
  console.log("=== Contract Successfully Deployed ===");
  console.log("Save this contract address for your frontend:");
  console.log(bakedPizza.address);
  console.log("");
  console.log("To open the kitchen (initialize the contract), run:");
  console.log(`npx hardhat run scripts/open-kitchen.js --network testnet`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
