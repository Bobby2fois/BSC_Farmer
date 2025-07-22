# CornMiner - BSC Yield Farming dApp

A yield farming dApp on Binance Smart Chain with a corn/farmer theme, allowing users to earn rewards through staking BNB.

**🌐 Live Website: [CornFarm.xyz](https://www.cornfarm.xyz/)**

## 🌽 Project Overview

CornMiner is a decentralized yield farming application built on Binance Smart Chain (BSC) that lets users stake BNB to earn passive income. The platform uses a farming metaphor where users:

1. Buy farmers (miners) with BNB
2. Harvest corn (rewards) over time
3. Choose to sell corn for BNB or compound by getting more farmers

## 🚀 Features

- **Buy Farmers**: Purchase farmers with BNB to start generating corn
- **Compound Rewards**: Reinvest your corn to get more farmers (compounding)
- **Sell Corn**: Convert your corn back to BNB anytime
- **Referral System**: Earn 15% of referred users' corn when they compound
- **Dynamic Fee Structure**: Encourages strategic farming with dynamic selling fees
  - First 3 sells per week: 5% base fee
  - Each additional sell: +5% fee (capped at 30%)
  - Weekly counter reset mechanism
- **Security Features**: Emergency withdrawal function for contract owner

## 📊 Smart Contract

The CornMiner smart contract is deployed to BSC Testnet at:
`0x13335b21C0083D75A18c34039acda8Aa88Fc5197`

### Key Contract Functions

- `buyCorn(address ref)`: Buy corn with BNB (payable)
- `popCorn(address ref)`: Compound your corn to get more farmers
- `sellCorn()`: Sell your corn for BNB
- `getMyCorns(address _adr)`: Get total corns for an address
- `getMyHarvesters(address _adr)`: Get total farmers for an address
- `getUserFeeInfo(address user)`: Get user's current fee percentage and sells remaining at base rate

## 🏗️ Project Structure

```
/miner/
├── contracts/            # Solidity contracts
│   ├── CornMiner.sol     # Main contract
│   ├── interfaces/       # Contract interfaces
│   └── libraries/        # Helper libraries
├── frontend/             # React frontend application
│   ├── public/           # Public assets
│   └── src/              # Source code
│       ├── components/   # React components
│       ├── contracts/    # Contract config & ABIs
│       ├── hooks/        # Custom React hooks
│       └── utils/        # Utility functions
├── scripts/              # Helper & deployment scripts
├── test/                 # Test files
└── README.md             # Project documentation
```

## 🛠️ Technologies Used

- **Smart Contract**: Solidity, Hardhat
- **Frontend**: React.js, ethers.js
- **Network**: Binance Smart Chain Testnet
- **Deployment**: Vercel (frontend), BSC Testnet (contract)

## 🚀 Getting Started

### Prerequisites

- Node.js and npm installed
- MetaMask or another Web3 wallet
- Testnet BNB (for BSC Testnet)

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/bobby2fois/farmer.git
   cd farmer
   ```

2. Install dependencies:
   ```
   npm install
   cd frontend
   npm install
   ```

3. Start the frontend locally:
   ```
   cd frontend
   npm start
   ```

### Deployment

#### Smart Contract

1. Configure your `.env` file with:
   ```
   PRIVATE_KEY=your_wallet_private_key
   BSCSCAN_API_KEY=your_bscscan_api_key
   ```

2. Deploy to BSC Testnet:
   ```
   npx hardhat run --network testnet scripts/deploy-contract.js
   ```

3. Verify contract on BSC Testnet:
   ```
   npx hardhat verify --network testnet CONTRACT_ADDRESS
   ```

#### Frontend

Deploy to Vercel with the following settings:
- Build Command: `npm run build`
- Output Directory: `build`
- Framework: `create-react-app`


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

The CornMiner contract is a yield farming contract that allows users to:

1. **Buy Farmer**: Users can purchase farmer with BNB
2. **Generate Corn**: Farmers produce corns over time
3. **Sell Corn**: Users can sell corn for BNB
4. **Pop Corn**: Convert corn to more farmers

### Key Features

- **Referral System**: Earn 15% of the corn used by your referrals
- **Market Mechanism**: Dynamic pricing based on contract balance and available corn
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
- Contract initialization
- Buying and selling functionality
- Referral system
- Calculation accuracy

## Security Considerations

The contract includes multiple security measures:
- Reentrancy protection
- Access control modifiers
- Event logging for transparency
- Custom errors for better error reporting