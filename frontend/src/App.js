import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import useWeb3 from './hooks/useWeb3';
import MinerDashboard from './components/MinerDashboard';
import './App.css';
import cornFieldBg from './corn_field.png';

function App() {
  const { account, contract, provider, connect, disconnect, chainId } = useWeb3();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bnbBalance, setBnbBalance] = useState('0');
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Show message with auto-clear
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };
  
  // Check if connected to BSC Testnet (ChainId 97)
  useEffect(() => {
    setIsCorrectNetwork(chainId === 97);
  }, [chainId]);

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Copy wallet address to clipboard
  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      showMessage('Address copied to clipboard!', 'success');
      setDropdownOpen(false);
    }
  };
  
  // Handle disconnect button
  const handleDisconnect = () => {
    disconnect();
    setDropdownOpen(false);
  };
  
  // Format BNB with 4 decimal places
  const formatBNB = (wei) => {
    if (!wei) return '0';
    const bnbValue = ethers.utils.formatEther(wei.toString());
    return parseFloat(bnbValue).toFixed(4);
  };

  // Fetch user's BNB balance
  const fetchBnbBalance = async () => {
    if (account && provider) {
      try {
        const balance = await provider.getBalance(account);
        setBnbBalance(formatBNB(balance));
      } catch (error) {
        console.error('Error fetching BNB balance:', error);
      }
    }
  };

  // Update BNB balance when account changes or every 15 seconds
  useEffect(() => {
    if (account) {
      fetchBnbBalance();
      
      // Set up polling to update balance
      const interval = setInterval(() => {
        fetchBnbBalance();
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [account, provider]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.wallet-dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="App">
      <div className="container">

        <header className="App-header">
          <h1>Corn Farm</h1>
          <p>🌽 Plant BNB. Harvest profits. It's honest farming on BSC 🌽</p>
        </header>

        <div className="wallet-section">
          <div className="wallet-header">
            <span>{account ? `Connected Wallet (${bnbBalance} BNB)` : 'Connect Your BSC Wallet'}</span>
          </div>
          
          <div className="wallet-button-container">
            {account ? (
              <div className="wallet-dropdown-container">
                <button 
                  className={`wallet-button ${isCorrectNetwork ? 'success' : 'error'}`} 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="wallet-address">{formatAddress(account)}</span>
                  <span className="dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
                </button>
                
                {dropdownOpen && (
                  <div className="wallet-dropdown">
                    <button className="dropdown-item" onClick={copyAddress}>
                      Copy Address
                    </button>
                    <button className="dropdown-item" onClick={handleDisconnect}>
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="connect-button" onClick={connect}>Connect Wallet</button>
            )}
          </div>
        </div>

        {account && !isCorrectNetwork && (
          <div className="network-warning">
            <strong>Wrong Network Detected</strong>
            <p>Please switch to BSC Testnet to use this application.</p>
          </div>
        )}

        {account && isCorrectNetwork && contract && (
          <MinerDashboard 
            account={account} 
            contract={contract} 
            provider={provider}
            externalMessage={message.text ? { text: message.text, type: message.type } : null}
            onShowMessage={showMessage}
          />
        )}
      </div>
    </div>
  );
}

export default App;
