import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import '../App.css';

const MinerDashboard = ({ account, contract, provider }) => {
  // State
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
        const marketEggs = await contract.marketEggs();
        
        // Get user data - using the correct contract functions for BSC
        // Try different function signature formats until one works
        let miners = ethers.BigNumber.from(0);
        try {
          // First try - contract expects address param
          miners = await contract.getMyMiners(account);
          console.log('getMyMiners succeeded with:', miners.toString());
        } catch (minerErr1) {
          try {
            // Alternate function name
            miners = await contract.hatcheryMiners(account);
            console.log('hatcheryMiners succeeded with:', miners.toString());
          } catch (minerErr2) {
            try {
              // Last resort - try getChefs 
              miners = await contract.getChefs(account);
              console.log('getChefs succeeded with:', miners.toString());
            } catch (minerErr3) {
              console.error('All miner retrieval methods failed');
              console.error(minerErr1, minerErr2, minerErr3);
            }
          }
        }
        
        // Similarly try different approaches for eggs
        let eggs = ethers.BigNumber.from(0);
        try {
          // First try with address parameter 
          eggs = await contract.getMyEggs(account);
          console.log('getMyEggs(account) succeeded with:', eggs.toString());
        } catch (eggErr1) {
          try {
            // Try without parameter
            eggs = await contract.getMyEggs();
            console.log('getMyEggs() succeeded with:', eggs.toString());
          } catch (eggErr2) {
            // Try direct mapping access
            try {
              const claimed = await contract.claimedEggs(account);
              const sinceLastHatch = await contract.getEggsSinceLastHatch(account);
              eggs = claimed.add(sinceLastHatch);
              console.log('Manual egg calculation succeeded with:', eggs.toString());
            } catch (eggErr3) {
              console.error('All egg retrieval methods failed');
              console.error(eggErr1, eggErr2, eggErr3);
            }
          }
        }
        
        // Calculate egg value using contract's calculateEggSell
        let eggValue = ethers.BigNumber.from(0);
        try {
          eggValue = await contract.calculateEggSell(eggs);
          console.log('calculateEggSell succeeded with:', formatBNB(eggValue));
        } catch (sellErr) {
          console.warn('Error calculating egg sell value, using estimate');
          // Fallback to simple estimate - basic formula used in many BSC miner contracts
          eggValue = balance.gt(0) ? 
            eggs.mul(balance).div(marketEggs.add(eggs)) : 
            ethers.BigNumber.from(0);
          console.log('Estimated egg value:', formatBNB(eggValue));
        }
        
        setUserStats({
          miners: miners.toString(),
          eggs: eggs.toString(),
          bnbValue: formatBNB(eggValue)
        });
        
        setContractStats({
          initialized,
          balance: formatBNB(balance),
          marketEggs: marketEggs.toString()
        });
      } catch (contractError) {
        console.error('Error reading contract state:', contractError);
        // Fallback if we can't read directly (older contract or missing functions)
        
        // Get contract balance
        const balance = await provider.getBalance(contract.address);
        
        // Assume contract is initialized if it has balance
        const initialized = balance.gt(0);
        
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
        
        // Simple estimate for egg value
        const eggValue = eggs.mul(balance).div(ethers.BigNumber.from("1000000000"));
        
        setUserStats({
          miners: miners.toString(),
          eggs: eggs.toString(),
          bnbValue: formatBNB(eggValue)
        });
        
        setContractStats({
          initialized,
          balance: formatBNB(balance),
          marketEggs: marketEggs.toString()
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
      
      // Get referral address or use own account
      const ref = referralAddress || account;
      console.log('Using referral address:', ref);
      
      // Convert BNB amount to wei
      const value = ethers.utils.parseEther(buyAmount);
      
      // Create direct interface to the contract functions
      // This bypasses any possible ABI issues in the React hooks
      const contractAddress = contract.address;
      const buyAbi = ['function bakePizza(address ref) payable'];
      const directContract = new ethers.Contract(contractAddress, buyAbi, provider.getSigner());
      
      // Try direct contract call
      console.log('Attempting direct contract call for buy...');
      let tx;
      
      try {
        console.log('Trying direct bakePizza(ref, {value}) call...');
        tx = await directContract.bakePizza(ref, { value });
        showMessage('Transaction sent. Buying miners...', 'info');
        
        // Wait for transaction confirmation
        console.log('Waiting for transaction confirmation...');
        await tx.wait();
        
        showMessage('Successfully bought miners!', 'success');
        
        // Reload data
        await loadData();
      } catch (err) {
        console.error('Buy miners operation failed:', err.message);
        throw new Error('Failed to buy miners: ' + err.message);
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
      
      // Get referral address or use the connected account
      const ref = referralAddress || account;
      console.log('Using referral address:', ref);
      
      // Create direct interface to the contract functions
      // This bypasses any possible ABI issues in the React hooks
      const contractAddress = contract.address;
      const rebakeAbi = ['function rebakePizza(address ref)', 'function hatchEggs(address ref)'];
      const directContract = new ethers.Contract(contractAddress, rebakeAbi, provider.getSigner());
      
      // Try direct contract call
      console.log('Attempting direct contract call...');
      let tx;
      
      try {
        console.log('Trying direct rebakePizza(ref) call...');
        tx = await directContract.rebakePizza(ref);
        showMessage('Transaction sent. Rebaking eggs...', 'info');
      } catch (err1) {
        console.warn('Direct rebakePizza(ref) failed:', err1.message);
        
        try {
          console.log('Trying direct hatchEggs(ref) call...');
          tx = await directContract.hatchEggs(ref);
          showMessage('Transaction sent. Rebaking eggs...', 'info');
        } catch (err2) {
          console.error('All direct rebake attempts failed');
          throw new Error('Failed to rebake eggs. Direct contract calls unsuccessful.');
        }
      }
      
      // Wait for transaction confirmation
      console.log('Waiting for transaction confirmation...');
      await tx.wait();
      
      showMessage('Successfully rebaked eggs into miners!', 'success');
      
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
      const sellAbi = ['function eatPizza()', 'function sellEggs()'];
      const directContract = new ethers.Contract(contractAddress, sellAbi, provider.getSigner());
      
      // Try direct contract call
      console.log('Attempting direct contract call for sell...');
      let tx;
      
      try {
        console.log('Trying direct eatPizza() call...');
        tx = await directContract.eatPizza();
        showMessage('Transaction sent. Selling eggs...', 'info');
      } catch (err1) {
        console.warn('Direct eatPizza() failed:', err1.message);
        
        try {
          console.log('Trying direct sellEggs() call...');
          tx = await directContract.sellEggs();
          showMessage('Transaction sent. Selling eggs...', 'info');
        } catch (err2) {
          console.error('All direct sell attempts failed');
          throw new Error('Failed to sell eggs. Direct contract calls unsuccessful.');
        }
      }
      
      // Wait for transaction confirmation
      console.log('Waiting for transaction confirmation...');
      await tx.wait();
      
      showMessage('Successfully sold eggs for BNB!', 'success');
      
      // Reload data
      await loadData();
      
    } catch (error) {
      console.error('Error selling eggs:', error);
      showMessage(error.message || 'Failed to sell eggs', 'error');
    } finally {
      setLoading(false);
    }
  };

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
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {/* Stats section */}
      <div className="stats-container">
        {/* User stats */}
        <div className="stats-card">
          <h2>Your Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Your Miners</div>
              <div className="stat-value">{formatNumber(userStats.miners)}</div>
              <div className="stat-help">Producing eggs</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Your Eggs</div>
              <div className="stat-value">{formatNumber(userStats.eggs)}</div>
              <div className="stat-help">Ready to sell or rebake</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Eggs Value</div>
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
              <div className="stat-label">Market Eggs</div>
              <div className="stat-value">{formatNumber(contractStats.marketEggs)}</div>
              <div className="stat-help">Affects egg prices</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Contract Status</div>
              <div className={`stat-value ${contractStats.initialized ? 'success-text' : 'error-text'}`}>
                {contractStats.initialized ? "Active" : "Not Initialized"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions section */}
      <div className="actions-card">
        <h2>Mining Actions</h2>
        
        {/* Buy miners */}
        <div className="action-section">
          <h3>Buy Miners</h3>
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
            <h3>Rebake Eggs</h3>
            <p className="help-text">Convert eggs to more miners (compound)</p>
            <button 
              className="action-button rebake-button"
              onClick={handleRebake}
              disabled={loading || userStats.eggs === '0'}
            >
              {loading ? 'Processing...' : 'Rebake Eggs'}
            </button>
          </div>
          
          <div className="action-section">
            <h3>Sell Eggs</h3>
            <p className="help-text">Sell eggs for {userStats.bnbValue} BNB</p>
            <button 
              className="action-button sell-button"
              onClick={handleSellEggs}
              disabled={loading || userStats.eggs === '0'}
            >
              {loading ? 'Processing...' : 'Sell Eggs'}
            </button>
          </div>
        </div>
      </div>
      
      {/* How it works */}
      <div className="info-card">
        <h2>How It Works</h2>
        <ol className="how-it-works">
          <li>Buy miners with BNB - they produce eggs over time</li>
          <li>You can rebake eggs to get more miners (compounding)</li>
          <li>Or sell your eggs for BNB anytime</li>
          <li>Refer friends to earn 15% of their eggs</li>
        </ol>
        <p className="contract-address">
          Contract Address: {contract.address}
        </p>
      </div>
    </div>
  );
};

export default MinerDashboard;
