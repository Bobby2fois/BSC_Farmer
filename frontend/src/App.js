import React, { useState, useEffect } from 'react';
import useWeb3 from './hooks/useWeb3';
import MinerDashboard from './components/MinerDashboard';
import './App.css';

function App() {
  const { account, contract, provider, connect, chainId } = useWeb3();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  
  // Check if connected to BSC Testnet (ChainId 97)
  useEffect(() => {
    setIsCorrectNetwork(chainId === 97);
  }, [chainId]);

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="App">
      <div className="container">
        <header className="App-header">
          <h1>Corn Farm</h1>
          <p>A yield farming dApp on Binance Smart Chain with a corn/farmer theme</p>
        </header>

        <div className="wallet-section">
          <div className="wallet-connect">
            <span>{account ? 'Connected Wallet' : 'Connect Your BSC Wallet'}</span>
            
            {account ? (
              <div className="wallet-info">
                <span>{formatAddress(account)}</span>
                <span className={`network-badge ${isCorrectNetwork ? 'success' : 'error'}`}>
                  {isCorrectNetwork ? 'BSC Testnet' : 'Wrong Network'}
                </span>
              </div>
            ) : (
              <button className="connect-button" onClick={connect}>Connect Wallet</button>
            )}
          </div>

          {account && !isCorrectNetwork && (
            <div className="network-warning">
              <strong>Wrong Network Detected</strong>
              <p>Please switch to BSC Testnet to use this application.</p>
            </div>
          )}
        </div>

        {account && isCorrectNetwork && contract && (
          <MinerDashboard 
            account={account} 
            contract={contract} 
            provider={provider}
          />
        )}
      </div>
    </div>
  );
}

export default App;
