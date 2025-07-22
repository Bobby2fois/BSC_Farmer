# BakedPizza BSC Miner

A yield farming dApp on Binance Smart Chain with a pizza/baker theme, allowing users to mine tokens through staking.

## Project Structure

```
/miner/
├── contracts/              # Solidity contracts
│   ├── BakedPizza.sol      # Main contract
│   ├── interfaces/         # Contract interfaces
│   └── libraries/          # Helper libraries
├── migrations/             # Deployment scripts
├── test/                   # Test files
├── frontend/               # Frontend application (to be developed)
├── scripts/                # Helper scripts
└── README.md               # Project documentation
```

## Smart Contract Improvements

The original contract has been significantly enhanced:

1. **Updated Solidity Version**: Upgraded to Solidity 0.8.x from 0.6.2
   - Built-in overflow/underflow protection
   - Better error handling with custom errors
   - Improved gas efficiency

2. **Security Enhancements**:
   - Replaced deprecated `now` with `block.timestamp`
   - Added reentrancy guards for all external-calling functions
   - Implemented proper events for all state-changing operations
   - Added custom errors for better gas efficiency and error reporting

3. **Code Quality**:
   - Added comprehensive NatSpec documentation
   - Improved naming consistency
   - Added proper access control modifiers

## Development Setup

### Prerequisites

- Node.js v14+ and npm
- Git

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your private key and BSCScan API key

### Development Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to BSC testnet
npm run deploy:testnet

# Deploy to BSC mainnet
npm run deploy:mainnet

# Verify contract on BSCScan (testnet)
npm run verify:testnet

# Verify contract on BSCScan (mainnet)
npm run verify:mainnet
```

## Contract Overview

The BakedPizza contract is a yield farming contract that allows users to:

1. **Buy Miners**: Users can purchase miners with BNB
2. **Generate Eggs**: Miners produce eggs over time
3. **Sell Eggs**: Users can sell eggs for BNB
4. **Rebake Eggs**: Convert eggs to more miners

### Key Features

- **Referral System**: Earn 15% of the eggs used by your referrals
- **Market Mechanism**: Dynamic pricing based on contract balance and available eggs
- **Dev Fee**: 5% fee on all operations goes to the contract owner

## BSC Deployment

### Testnet Deployment

1. Ensure your account has testnet BNB (get from [BSC Faucet](https://testnet.binance.org/faucet-smart))
2. Run `npm run deploy:testnet`
3. Run `npm run verify:testnet` to verify the contract on BSCScan

### Mainnet Deployment

1. Ensure you have real BNB for deployment gas fees
2. Double-check all settings before mainnet deployment
3. Run `npm run deploy:mainnet`
4. Run `npm run verify:mainnet` to verify the contract on BSCScan

## Testing

Run the tests with:

```
npm test
```

Tests cover basic functionality including:
- Contract deployment
- Kitchen initialization
- Buying and selling functionality
- Referral system
- Calculation accuracy

## Security Considerations

The contract includes multiple security measures:
- Reentrancy protection
- Access control modifiers
- Event logging for transparency
- Custom errors for better error reporting

## Frontend Development (Next Steps)

- Develop a React.js-based frontend
- Integrate with contract using ethers.js
- Implement wallet connection via Web3Modal

## License

MIT
