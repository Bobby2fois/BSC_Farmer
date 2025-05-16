import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { networkConfig, contractConfig } from '../contracts/config';

// Local storage key for wallet persistence
const WALLET_CONNECTED_KEY = 'BSC_MINER_WALLET_CONNECTED';

const useWeb3 = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [persistedConnection, setPersistedConnection] = useState(() => {
    // Check if we have a persisted connection on init
    return localStorage.getItem(WALLET_CONNECTED_KEY) === 'true';
  });

  // Function to check if MetaMask is available and prioritize it over other wallets
  const isMetaMaskAvailable = () => {
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      return false;
    }
    
    // If this is Phantom wallet, reject it
    if (window.ethereum.isPhantom) {
      console.log('Phantom wallet detected. This dApp only supports MetaMask for BSC.');
      return false;
    }
    
    // If we have multiple providers, find MetaMask specifically
    if (window.ethereum.providers) {
      const metamaskProvider = window.ethereum.providers.find(provider => provider.isMetaMask);
      if (metamaskProvider) {
        // Set the found MetaMask provider as the default ethereum provider
        window.ethereum = metamaskProvider;
        console.log('Multiple providers found. MetaMask prioritized.');
        return true;
      }
    }
    
    // Default case: if we have ethereum and it's MetaMask (or not explicitly Phantom)
    return window.ethereum.isMetaMask || !window.ethereum.isPhantom;
  };

  // Connect directly to MetaMask/Ethereum provider
  const connect = useCallback(async () => {
    try {
      setConnectionError('');
      console.log('Connecting to wallet...');
      
      if (!isMetaMaskAvailable()) {
        const error = 'MetaMask not detected. Please install MetaMask extension for BSC transactions.';
        console.error(error);
        setConnectionError(error);
        return null;
      }
      
      // Double-check for Phantom even after the check in isMetaMaskAvailable
      if (window.ethereum.isPhantom) {
        const error = 'Phantom wallet detected. Please use MetaMask for BSC transactions.';
        console.error(error);
        setConnectionError(error);
        return null;
      }

      // Request accounts directly from provider
      console.log('Requesting accounts...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        setConnectionError('No accounts found. Please unlock your wallet.');
        return null;
      }
      
      // Save connection state in localStorage for persistence
      localStorage.setItem(WALLET_CONNECTED_KEY, 'true');

      // Create ethers provider
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const chainIdHex = await web3Provider.send('eth_chainId', []);
      const parsedChainId = parseInt(chainIdHex, 16);

      // Check if on BSC Testnet (97)
      if (parsedChainId !== networkConfig.chainId) {
        try {
          // Try to switch to BSC Testnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${networkConfig.chainId.toString(16)}` }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              // Add BSC Testnet to wallet
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${networkConfig.chainId.toString(16)}`,
                    chainName: networkConfig.name,
                    nativeCurrency: networkConfig.nativeCurrency,
                    rpcUrls: networkConfig.rpcUrls,
                    blockExplorerUrls: networkConfig.blockExplorerUrls,
                  },
                ],
              });
            } catch (addError) {
              setConnectionError(`Failed to add BSC network: ${addError.message}`);
              return;
            }
          } else {
            setConnectionError(`Failed to switch to BSC network: ${switchError.message}`);
            return;
          }
        }
      }

      // Reload provider and signer after network switch
      const updatedProvider = new ethers.providers.Web3Provider(window.ethereum);
      const updatedSigner = updatedProvider.getSigner();
      const updatedChainId = await updatedProvider.getNetwork().then(network => network.chainId);

      // Create contract instance
      const contractInstance = new ethers.Contract(
        contractConfig.address,
        contractConfig.abi,
        updatedSigner
      );

      // Update state
      setProvider(updatedProvider);
      setSigner(updatedSigner);
      setAccount(accounts[0]);
      setChainId(updatedChainId);
      setContract(contractInstance);
      setIsConnected(true);
      
      // Setup event listeners for account/chain changes
      window.ethereum.on('accountsChanged', (newAccounts) => {
        if (newAccounts.length === 0) {
          // User disconnected their wallet
          disconnect();
        } else {
          setAccount(newAccounts[0]);
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        // Always refresh on chain change
        window.location.reload();
      });

      return { provider: updatedProvider, signer: updatedSigner, account: accounts[0] };
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError(error.message || 'Failed to connect wallet');
      return null;
    }
  }, []);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount('');
    setChainId(null);
    setContract(null);
    setIsConnected(false);
    
    // Clear wallet persistence from localStorage
    localStorage.removeItem(WALLET_CONNECTED_KEY);
    setPersistedConnection(false);
    
    // Remove event listeners if any were set
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }, []);
  
  // Auto-reconnect function for wallet persistence
  const autoConnect = useCallback(async () => {
    if (persistedConnection && isMetaMaskAvailable()) {
      try {
        console.log('Auto-connecting to previously connected wallet...');
        await connect();
      } catch (error) {
        console.error('Failed to auto-connect:', error);
        // If auto-connect fails, clear the persisted state
        localStorage.removeItem(WALLET_CONNECTED_KEY);
        setPersistedConnection(false);
      }
    }
  }, [persistedConnection, connect]);
  
  // Run auto-connect on component mount
  useEffect(() => {
    autoConnect();
  }, [autoConnect]);

  return {
    provider,
    signer,
    account,
    chainId,
    contract,
    isConnected,
    connectionError,
    connect,
    disconnect,
    isMetaMaskAvailable
  };
};

export default useWeb3;
