const { ethers } = require("hardhat");

// You need to manually set this to the deployed contract address
const DEPLOYED_CONTRACT_ADDRESS = "0xde38d419D2028041E1674607bBB4D80e64E91eAF";

async function main() {
  if (DEPLOYED_CONTRACT_ADDRESS === "REPLACE_WITH_YOUR_CONTRACT_ADDRESS") {
    console.error("ERROR: You need to set the DEPLOYED_CONTRACT_ADDRESS in the script");
    return;
  }

  console.log("Opening the kitchen (initializing the contract)...");

  // Get the contract instance
  const BakedPizza = await ethers.getContractFactory("BakedPizza");
  const bakedPizza = await BakedPizza.attach(DEPLOYED_CONTRACT_ADDRESS);
  
  // Open the kitchen (initialize the contract)
  const tx = await bakedPizza.openKitchen();
  await tx.wait();
  
  console.log("Kitchen opened successfully!");
  console.log("Contract is now initialized and ready for use");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
