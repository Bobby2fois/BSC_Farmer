// Script to execute emergency withdrawal from the CornMiner contract
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting emergency withdrawal process...");
  
  // Get the deployed contract
  const CornMiner = await ethers.getContractFactory("CornMiner");
  
  // The contract address on BSC Testnet
  const contractAddress = "0xDe5eAE3E1EDDd126E563A6B59778685716882ce0";
  
  // Connect to the deployed contract
  const cornMiner = await CornMiner.attach(contractAddress);
  
  console.log(`Connected to CornMiner contract at ${contractAddress}`);
  
  // Get the contract balance before withdrawal
  const balanceBefore = await ethers.provider.getBalance(contractAddress);
  console.log(`Contract balance before withdrawal: ${ethers.utils.formatEther(balanceBefore)} BNB`);
  
  // Execute emergency withdrawal
  try {
    console.log("Calling emergencyWithdraw function...");
    const tx = await cornMiner.emergencyWithdraw();
    
    console.log("Transaction sent! Waiting for confirmation...");
    const receipt = await tx.wait();
    
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check for EmergencyWithdrawal event
    const withdrawalEvent = receipt.events.find(e => e.event === "EmergencyWithdrawal");
    if (withdrawalEvent) {
      const [owner, amount] = withdrawalEvent.args;
      console.log(`Emergency withdrawal successful!`);
      console.log(`Owner: ${owner}`);
      console.log(`Amount withdrawn: ${ethers.utils.formatEther(amount)} BNB`);
    }
    
    // Get the contract balance after withdrawal
    const balanceAfter = await ethers.provider.getBalance(contractAddress);
    console.log(`Contract balance after withdrawal: ${ethers.utils.formatEther(balanceAfter)} BNB`);
  } catch (error) {
    console.error("Emergency withdrawal failed:", error.message);
    
    // Try to provide more details about the error
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    
    if (error.data) {
      try {
        const errorData = cornMiner.interface.parseError(error.data);
        console.error("Parsed error:", errorData);
      } catch (e) {
        console.error("Failed to parse error data");
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
