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

## 🚀 How to Use CornMiner

### Prerequisites

- MetaMask or another Web3 wallet installed in your browser
- BSC Testnet configured in your wallet
  - Network Name: BSC Testnet
  - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
  - Chain ID: 97
  - Currency Symbol: BNB
  - Block Explorer: https://testnet.bscscan.com
- Testnet BNB in your wallet (get from [BSC Faucet](https://testnet.binance.org/faucet-smart))

### Interacting with CornMiner

1. **Connect Your Wallet**:
   - Visit [CornFarm.xyz](https://www.cornfarm.xyz/)
   - Click "Connect Wallet" and select MetaMask
   - Ensure you're on BSC Testnet network

2. **Buy Farmers**:
   - Enter the amount of BNB you want to invest
   - Click "Buy Farmers" to purchase farmers who will generate corn
   - Approve the transaction in your wallet

3. **Manage Your Farm**:
   - Monitor your corn production in real-time
   - Choose your strategy:
     - **Compound**: Click "Pop Corn" to reinvest your corn into more farmers
     - **Harvest**: Click "Sell Corn" to convert your corn to BNB

4. **Referral Program**:
   - Get your unique referral link from the dashboard
   - Share with friends to earn 15% of their corn when they compound
   - No limit to how many people you can refer

## Security Considerations

The contract includes multiple security measures:
- Reentrancy protection
- Access control modifiers
- Event logging for transparency
- Custom errors for better error reporting
