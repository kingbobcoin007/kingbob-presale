import React, { useState, useEffect } from 'react';
import { connectWallet, getBNBBalance } from '../utils/ethersHelpers';

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if wallet was previously connected
    const checkConnection = async () => {
      try {
        // Check if MetaMask is installed
        if (!window.ethereum) {
          console.log('MetaMask not detected');
          return;
        }

        // Check if already connected
        if (window.ethereum.selectedAddress) {
          const addr = window.ethereum.selectedAddress;
          console.log('Already connected to wallet:', addr);
          setAddress(addr);
          onConnect(addr);
          updateBalance(addr);
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          console.log('Account changed:', accounts);
          if (accounts.length === 0) {
            // User disconnected their wallet
            setAddress('');
            setBalance('');
          } else {
            setAddress(accounts[0]);
            onConnect(accounts[0]);
            updateBalance(accounts[0]);
          }
        });
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    };

    checkConnection();

    // Cleanup event listeners
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [onConnect]);

  const updateBalance = async (addr: string) => {
    try {
      const bnbBalance = await getBNBBalance(addr);
      setBalance(parseFloat(bnbBalance).toFixed(4));
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask to connect your wallet.');
      }

      console.log('Attempting to connect wallet...');
      const addr = await connectWallet();
      
      if (!addr) {
        throw new Error('No wallet address returned. Please check your MetaMask extension.');
      }
      
      console.log('Successfully connected to wallet:', addr);
      setAddress(addr);
      onConnect(addr);
      updateBalance(addr);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      
      // Show alert for common issues
      if (err.message.includes('MetaMask not detected')) {
        alert('MetaMask is not installed! Please install the MetaMask browser extension to connect your wallet.');
      } else if (err.message.includes('User rejected')) {
        // User rejected the connection request, no need for alert
        setError('Connection request rejected. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {address ? (
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-r from-red-900 to-yellow-600 text-white px-4 py-2 rounded-full shadow-lg">
            <span className="font-bold">{address.slice(0, 6)}...{address.slice(-4)}</span>
            {balance && <span className="ml-2 text-yellow-200">{balance} BNB</span>}
          </div>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-gradient-to-r from-red-800 to-yellow-500 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:from-red-700 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-70"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
    </div>
  );
};

export default WalletConnect;
