import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import '../App.css';

const MinerDashboard = ({ account, contract, provider, externalMessage, onShowMessage }) => {
  // Stat
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    miners: '0',
    eggs: '0',
    bnbValue: '0',
  });
  const [contractStats, setContractStats] = useState({
    initialized: false,
    balance: '0',
    marketEggs: '0',
    tvlUsd: '0',
  });
  const [buyAmount, setBuyAmount] = useState('0.1');
  const [referralAddress, setReferralAddress] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Format BNB with 4 decimal places
  const formatBNB = (wei) => {
    if (!wei) return '0';
    const bnbValue = ethers.utils.formatEther(wei.toString());
    return parseFloat(bnbValue).toFixed(4);
  };

  // Show message with auto-clear
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Format large numbers with commas
  const formatNumber = (num) => {
    return parseInt(num).toLocaleString();
  };

  // State for BNB price
  const [bnbPrice, setBnbPrice] = useState(0);
  
  // Fetch BNB price from CoinGecko API (no CORS issues)
  const fetchBnbPrice = async () => {
    try {
      console.log('Fetching BNB price from CoinGecko...');
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('BNB price data:', data);
      
      if (data && data.binancecoin && data.binancecoin.usd) {
        const price = parseFloat(data.binancecoin.usd);
        console.log('Fetched BNB price:', price);
        setBnbPrice(price);
        return price;
      } else {
        console.error('Invalid price data format from CoinGecko API');
        return 0;
      }
    } catch (error) {
      console.error('Error fetching BNB price:', error);
      return 0;
    }
  };
  
  // Get the current BNB price, fetching if needed
  const getBnbPrice = () => {
    // If price is 0, use a fallback value until the fetch completes
    return bnbPrice > 0 ? bnbPrice : 684.40; // Fallback price if not yet fetched
  };

  // Load data from contract
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to read directly from contract if it's deployed
      try {
        // Check if contract is initialized
        const initialized = await contract.initialized();
        
        // Get contract data
        const balance = await provider.getBalance(contract.address);
        const marketCorns = await contract.marketCorns();
        
        // Make sure we have the latest BNB price
        let currentBnbPrice = getBnbPrice();
        const balanceBNB = parseFloat(formatBNB(balance));
        
        // Try to fetch a fresh price if we don't have one yet
        if (bnbPrice === 0) {
          try {
            currentBnbPrice = await fetchBnbPrice() || currentBnbPrice;
          } catch (error) {
            console.warn('Could not fetch fresh BNB price:', error);
          }
        }
        
        // Calculate TVL and format with commas for thousands
        const tvlValue = balanceBNB * currentBnbPrice;
        const tvlUsd = tvlValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        console.log('TVL calculation:', { balanceBNB, bnbPrice: currentBnbPrice, tvlValue, tvlUsd });
        
        console.log('Contract state:', {
          initialized: initialized.toString(),
          balance: formatBNB(balance),
          marketCorns: marketCorns.toString(),
          tvlUsd: tvlUsd
        });
        
        // Get user data - using the correct contract functions for BSC
        // Try different function signature formats until one works
        let farmers = ethers.BigNumber.from(0);
        try {
          // First try - contract expects address param
          farmers = await contract.getMyHarvesters(account);
          console.log('getMyHarvesters succeeded with:', farmers.toString());
        } catch (farmerErr1) {
          try {
            // Alternate function name - direct mapping access
            farmers = await contract.hatcheryHarvesters(account);
            console.log('hatcheryHarvesters succeeded with:', farmers.toString());
          } catch (farmerErr2) {
            console.error('All farmer retrieval methods failed');
            console.error(farmerErr1, farmerErr2);
          }
        }
        
        // Similarly try different approaches for corns
        let corns = ethers.BigNumber.from(0);
        try {
          // First try with address parameter 
          corns = await contract.getMyCorns(account);
          console.log('getMyCorns(account) succeeded with:', corns.toString());
        } catch (cornErr1) {
          try {
            // Try direct mapping access
            const claimed = await contract.claimedCorns(account);
            const sinceLastHatch = await contract.getCornsSinceLastHatch(account);
            corns = claimed.add(sinceLastHatch);
            console.log('Manual corn calculation succeeded with:', corns.toString());
          } catch (cornErr2) {
            console.error('All corn retrieval methods failed');
            console.error(cornErr1, cornErr2);
          }
        }
        
        // Calculate corn value using contract's calculateCornSell
        let cornValue = ethers.BigNumber.from(0);
        try {
          cornValue = await contract.calculateCornSell(corns);
          console.log('calculateCornSell succeeded with:', formatBNB(cornValue));
        } catch (sellErr) {
          console.warn('Error calculating corn sell value, using estimate');
          // Fallback to simple estimate - basic formula used in many BSC miner contracts
          cornValue = balance.gt(0) ? 
            corns.mul(balance).div(marketCorns.add(corns)) : 
            ethers.BigNumber.from(0);
          console.log('Estimated corn value:', formatBNB(cornValue));
        }
        
        console.log('Final calculations:');
        console.log('- Farmers (harvesters):', farmers.toString());
        console.log('- Corn amount:', corns.toString());
        console.log('- Corn BNB value:', formatBNB(cornValue));
        
        setUserStats({
          miners: farmers.toString(),
          eggs: corns.toString(),
          bnbValue: formatBNB(cornValue)
        });
        
        setContractStats({
          initialized,
          balance: formatBNB(balance),
          marketEggs: marketCorns.toString(),
          tvlUsd: tvlUsd
        });
      } catch (contractError) {
        console.error('Error reading contract state:', contractError);
        // Fallback if we can't read directly (older contract or missing functions)
        
        // Get contract balance
        const balance = await provider.getBalance(contract.address);
        
        // Assume contract is initialized if it has balance
        const initialized = balance.gt(0);
        
        // Make sure we have the latest BNB price for fallback path
        let currentBnbPrice = getBnbPrice();
        const balanceBNB = parseFloat(formatBNB(balance));
        
        // Try to fetch a fresh price if we don't have one yet
        if (bnbPrice === 0) {
          try {
            currentBnbPrice = await fetchBnbPrice() || currentBnbPrice;
          } catch (error) {
            console.warn('Could not fetch fresh BNB price for fallback:', error);
          }
        }
        
        // Calculate TVL and format with commas for thousands
        const tvlValue = balanceBNB * currentBnbPrice;
        const tvlUsd = tvlValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        console.log('Fallback TVL calculation:', { balanceBNB, bnbPrice: currentBnbPrice, tvlValue, tvlUsd });
        
        // Will update contractStats after collecting available data
        
        // Use available functions or fallbacks
        let miners = ethers.BigNumber.from(0);
        let eggs = ethers.BigNumber.from(0);
        let marketEggs = ethers.BigNumber.from(0);
        
        try { miners = await contract.getChefs(account); } 
        catch (e) { console.warn('getChefs failed:', e.message); }
        
        try { eggs = await contract.getMyEggs(); } 
        catch (e) { console.warn('getMyEggs failed:', e.message); }
        
        try { marketEggs = await contract.pizzaRewards(); } 
        catch (e) { console.warn('pizzaRewards failed:', e.message); }
        
        // Calculate market metrics for corn price
        // Using simplified math for common BSC farm contracts
        const cornsPerHarvester = 86400; // Standard value in many fork contracts
        
        // Set state with loaded data
        setUserStats({
          miners: formatNumber(miners),
          eggs: formatNumber(eggs),
          bnbValue: formatBNB(eggs.mul(balance).div(marketEggs))
        });
        
        setContractStats({
          initialized,
          balance: formatBNB(balance),
          marketEggs: marketEggs.toString(),
          tvlUsd: tvlUsd
        });
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('Failed to load data from contract', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Buy miners
  const handleBuyMiners = async () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      showMessage('Please enter a valid amount of BNB', 'error');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to buy miners with', buyAmount, 'BNB');
      
      // Check if the user has enough BNB before proceeding
      try {
        const balance = await provider.getBalance(account);
        const buyAmountWei = ethers.utils.parseEther(buyAmount);
        
        // Add 10% buffer for gas
        const requiredAmount = buyAmountWei.mul(110).div(100);
        
        if (balance.lt(requiredAmount)) {
          throw new Error('Insufficient funds');
        }
      } catch (balanceError) {
        console.error('Error checking balance:', balanceError);
        throw balanceError;
      }
      
      // Validate referral address if provided
      let ref = account; // Default to own account
      
      if (referralAddress) {
        // Check if it's a valid Ethereum address format
        if (!ethers.utils.isAddress(referralAddress)) {
          throw new Error('Invalid referral address format');
        }
        ref = referralAddress;
      }
      
      console.log('Using referral address:', ref);
      
      // Convert BNB amount to wei
      const value = ethers.utils.parseEther(buyAmount);
      
      // Create direct interface to the contract functions
      // This bypasses any possible ABI issues in the React hooks
      const contractAddress = contract.address;
      const buyAbi = ['function buyCorn(address ref) payable'];
      const directContract = new ethers.Contract(contractAddress, buyAbi, provider.getSigner());
      
      // Try direct contract call
      console.log('Attempting direct contract call for buy...');
      let tx;
      
      try {
        console.log('Trying direct buyCorn(ref, {value}) call...');
        tx = await directContract.buyCorn(ref, { value });
        showMessage('Transaction sent. Buying farmers...', 'info');
        
        // Wait for transaction confirmation
        console.log('Waiting for transaction confirmation...');
        await tx.wait();
        
        showMessage('Successfully bought farmers!', 'success');
        
        // Reload data
        await loadData();
      } catch (err) {
        console.error('Buy miners operation failed:', err.message);
        
        // Check if user rejected the transaction in MetaMask
        if (err.message.includes('user rejected') || 
            err.message.includes('User denied') || 
            err.message.includes('User rejected') ||
            err.code === 'ACTION_REJECTED') {
          throw new Error('User rejected transaction');
        } else if (err.message.includes('insufficient funds')) {
          throw new Error('Insufficient BNB for gas fees');
        } else {
          throw new Error('Failed to buy farmers. Please try again.');
        }
      }
      
    } catch (error) {
      console.error('Error buying miners:', error);
      showMessage(error.message || 'Failed to buy miners', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Rebake eggs to get more miners - using direct contract call via ethers
  const handleRebake = async () => {
    try {
      setLoading(true);
      
      // Validate referral address if provided
      let ref = account; // Default to own account
      
      if (referralAddress) {
        // Check if it's a valid Ethereum address format
        if (!ethers.utils.isAddress(referralAddress)) {
          throw new Error('Invalid referral address format');
        }
        ref = referralAddress;
      }
      
      console.log('Using referral address:', ref);
      
      // Create direct interface to the contract functions
      // This bypasses any possible ABI issues in the React hooks
      const contractAddress = contract.address;
      const rebakeAbi = ['function popCorn(address ref)'];
      const directContract = new ethers.Contract(contractAddress, rebakeAbi, provider.getSigner());
      
      // Try direct contract call
      console.log('Attempting direct contract call...');
      let tx;
      
      try {
        console.log('Trying direct popCorn(ref) call...');
        tx = await directContract.popCorn(ref);
        showMessage('Transaction sent. Popping corn...', 'info');
      } catch (err) {
        console.error('Direct popCorn(ref) call failed:', err.message);
        
        // Check if user rejected the transaction in MetaMask
        if (err.message.includes('user rejected') || 
            err.message.includes('User denied') || 
            err.message.includes('User rejected') ||
            err.code === 'ACTION_REJECTED') {
          throw new Error('User rejected transaction');
        } else if (err.message.includes('insufficient funds')) {
          throw new Error('Insufficient BNB for gas fees');
        } else {
          throw new Error('Failed to pop corn. Please try again.');
        }
      }
      
      // Wait for transaction confirmation
      console.log('Waiting for transaction confirmation...');
      await tx.wait();
      
      showMessage('Successfully popped corn into new farmers!', 'success');
      
      // Reload data
      await loadData();
      
    } catch (error) {
      console.error('Error rebaking eggs:', error);
      showMessage(error.message || 'Failed to rebake eggs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sell eggs for BNB
  const handleSellEggs = async () => {
    try {
      setLoading(true);
      console.log('Attempting to sell eggs...');
      
      // Create direct interface to the contract functions
      // This bypasses any possible ABI issues in the React hooks
      const contractAddress = contract.address;
      const sellAbi = ['function sellCorn()'];
      const directContract = new ethers.Contract(contractAddress, sellAbi, provider.getSigner());
      
      // Try direct contract call
      console.log('Attempting direct contract call for sell...');
      let tx;
      
      try {
        console.log('Trying direct sellCorn() call...');
        tx = await directContract.sellCorn();
        showMessage('Transaction sent. Selling corn...', 'info');
      } catch (err) {
        console.error('Direct sellCorn() call failed:', err.message);
        
        // Check if user rejected the transaction in MetaMask
        if (err.message.includes('user rejected') || 
            err.message.includes('User denied') || 
            err.message.includes('User rejected') ||
            err.code === 'ACTION_REJECTED') {
          throw new Error('User rejected transaction');
        } else if (err.message.includes('insufficient funds')) {
          throw new Error('Insufficient BNB for gas fees');
        } else {
          throw new Error('Failed to sell corn. Please try again.');
        }
      }
      
      // Wait for transaction confirmation
      console.log('Waiting for transaction confirmation...');
      await tx.wait();
      
      showMessage('Successfully sold corn for BNB!', 'success');
      
      // Reload data
      await loadData();
      
    } catch (error) {
      console.error('Error selling eggs:', error);
      showMessage(error.message || 'Failed to sell eggs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch BNB price on component mount and periodically
  useEffect(() => {
    // Initial fetch
    fetchBnbPrice();
    
    // Set up periodic price updates (every 5 minutes)
    const priceInterval = setInterval(() => {
      fetchBnbPrice();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
    
    // Clean up interval on component unmount
    return () => clearInterval(priceInterval);
  }, []); // Empty dependency array means this runs once on mount

  // Load data on component mount
  useEffect(() => {
    if (account && contract && provider) {
      loadData();
      
      // Set up an interval to refresh data every 30 seconds
      const interval = setInterval(() => {
        loadData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [account, contract, provider]);

  if (loading && userStats.miners === '0') {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading miner data...</p>
      </div>
    );
  }

  return (
    <div className="miner-dashboard">
      {/* Message display */}
      {(message.text || externalMessage) && (
        <div className={`message ${externalMessage ? externalMessage.type : message.type}`}>
          {externalMessage ? externalMessage.text : message.text}
        </div>
      )}
      
      {/* Stats section */}
      <div className="stats-container">
        {/* User stats */}
        <div className="stats-card">
          <h2>Your Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Your Farmers</div>
              <div className="stat-value">{formatNumber(userStats.miners)}</div>
              <div className="stat-help">Producing corns</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Your Corns</div>
              <div className="stat-value">{formatNumber(userStats.eggs)}</div>
              <div className="stat-help">Ready to sell or pop</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Corns Value</div>
              <div className="stat-value">{userStats.bnbValue} BNB</div>
              <div className="stat-help">Current market value</div>
            </div>
          </div>
        </div>
        
        {/* Contract stats */}
        <div className="stats-card">
          <h2>Contract Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Contract Balance</div>
              <div className="stat-value">{contractStats.balance} BNB</div>
              <div className="stat-help">Total BNB locked</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Market Corns</div>
              <div className="stat-value">{formatNumber(contractStats.marketEggs)}</div>
              <div className="stat-help">Affects corn prices</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">TVL in USD</div>
              <div className="stat-value">
                ${contractStats.tvlUsd}
              </div>
              <div className="stat-help">Total Value Locked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions section */}
      <div className="actions-card">
        <h2>Farming Actions</h2>
        
        {/* Buy miners */}
        <div className="action-section">
          <h3>Buy Farmers</h3>
          <div className="buy-miners-controls">
            <div className="input-group">
              <input 
                type="number" 
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                min="0.01"
                step="0.01"
              />
              <span className="input-addon">BNB</span>
            </div>
            <button 
              className="action-button buy-button"
              onClick={handleBuyMiners}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Buy'}
            </button>
          </div>
        </div>
        
        <div className="divider"></div>
        
        {/* Referral */}
        <div className="action-section">
          <h3>Referral Address (Optional)</h3>
          <input
            type="text"
            className="referral-input"
            placeholder="0x..."
            value={referralAddress}
            onChange={(e) => setReferralAddress(e.target.value)}
          />
          <p className="help-text">
            Enter a referral address to give them 15% of your eggs. Leave empty to use your own address.
          </p>
        </div>
        
        <div className="divider"></div>
        
        {/* Egg actions */}
        <div className="egg-actions">
          <div className="action-section">
            <h3>Pop corn</h3>
            <p className="help-text">Feed more farmers with corn (compound)</p>
            <button 
              className="action-button rebake-button"
              onClick={handleRebake}
              disabled={loading || userStats.eggs === '0'}
            >
              {loading ? 'Processing...' : 'Pop Corn'}
            </button>
          </div>
          
          <div className="action-section">
            <h3>Sell Corn</h3>
            <p className="help-text">Sell corn for {userStats.bnbValue} BNB</p>
            <button 
              className="action-button sell-button"
              onClick={handleSellEggs}
              disabled={loading || userStats.eggs === '0'}
            >
              {loading ? 'Processing...' : 'Sell Corn'}
            </button>
          </div>
        </div>
      </div>
      
      {/* How it works */}
      <div className="info-card">
        <h2>How It Works</h2>
        <ol className="how-it-works">
          <li>Buy farmers with BNB - they produce corn over time</li>
          <li>You can pop corn to get more farmers (compounding)</li>
          <li>Or sell your corn for BNB anytime</li>
          <li>Refer friends to earn 15% of their corn when they compound</li>
        </ol>
        <p className="contract-address">
          Contract Address: {contract.address}
        </p>
      </div>
    </div>
  );
};

export default MinerDashboard;
