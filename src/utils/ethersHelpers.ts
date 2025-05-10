// @ts-nocheck
import { ethers } from 'ethers';
import { db, usersCollection } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import * as KingbobContract from '../contracts/KingbobContract';

// Define package prices in BNB (using current BNB/USD rate)
export const PACKAGES = [
  { id: 'basic', name: 'Basic', priceUSD: 100, priceBNB: '0.25', tokenAmount: 1000, refillCount: 0 },
  { id: 'standard', name: 'Standard', priceUSD: 200, priceBNB: '0.5', tokenAmount: 2200, refillCount: 4 },
  { id: 'premium', name: 'Premium', priceUSD: 500, priceBNB: '1.25', tokenAmount: 6000, refillCount: 0 },
  { id: 'royal', name: 'Royal', priceUSD: 1000, priceBNB: '2.5', tokenAmount: 13000, refillCount: 0 },
];

// Token price calculation based on $35,000 BNB + $35,000 worth of KINGBOB
export const calculateTokenPrice = () => {
  // Assuming $35,000 worth of BNB and $35,000 worth of KINGBOB tokens
  const bnbLiquidity = 35000; // in USD
  // Total value of KINGBOB tokens in the liquidity pool will be equal to BNB value
  
  // Assuming 1 BNB = $400 and total token supply for liquidity
  const bnbPrice = 400; // USD per BNB
  const bnbAmount = bnbLiquidity / bnbPrice; // Amount of BNB in liquidity pool
  const tokenAmount = 350000; // Amount of tokens in liquidity pool
  
  // Calculate token price in BNB
  const tokenPriceInBNB = bnbAmount / tokenAmount;
  
  return tokenPriceInBNB;
};

// Referral reward in tokens (equivalent to $20)
export const REFERRAL_REWARD = 200; // $20 worth of tokens

// Get ethers provider
export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('MetaMask not detected');
};

// Connect wallet
export const connectWallet = async () => {
  // Check if MetaMask is installed
  if (!window.ethereum) {
    console.error('MetaMask not detected');
    alert('MetaMask is not installed! Please install MetaMask to connect your wallet.');
    throw new Error('MetaMask not detected');
  }
  
  try {
    console.log('Requesting accounts...');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your MetaMask and try again.');
    }
    
    const address = accounts[0];
    console.log('Connected wallet address:', address);
    
    // Check if user exists in Firestore, if not create a new record
    const userRef = doc(db, usersCollection, address);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Get referrer from URL if available
      const urlParams = new URLSearchParams(window.location.search);
      const referrer = urlParams.get('ref');
      
      // Create new user
      await setDoc(userRef, {
        address,
        referrer: referrer || null,
        tokenBalance: 0,
        package: null,
        refillCount: 0,
        refillsUsed: 0,
        referralRewards: 0,
        referralCount: 0,
        claimEnabled: false,
        createdAt: new Date().toISOString()
      });
      
      // Update referrer's stats if exists
      if (referrer) {
        const referrerRef = doc(db, usersCollection, referrer);
        const referrerSnap = await getDoc(referrerRef);
        
        if (referrerSnap.exists()) {
          const currentReferralCount = referrerSnap.data().referralCount || 0;
          const currentReferralRewards = referrerSnap.data().referralRewards || 0;
          
          await updateDoc(referrerRef, {
            referralRewards: currentReferralRewards + REFERRAL_REWARD,
            referralCount: currentReferralCount + 1
          });
        }
      }
    }
    
    return address;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// Get BNB balance
export const getBNBBalance = async (address: string) => {
  const provider = getProvider();
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

// Get token balance from contract
export const getTokenBalance = async (address: string) => {
  try {
    const provider = getProvider();
    return await KingbobContract.getTokenBalance(provider, address);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0';
  }
};

// Get refill count from contract
export const getRefillCount = async (address: string) => {
  try {
    const provider = getProvider();
    return await KingbobContract.getRefillCount(provider, address);
  } catch (error) {
    console.error('Error getting refill count:', error);
    return '0';
  }
};

// Get referrer address from contract
export const getReferrer = async (address: string) => {
  try {
    const provider = getProvider();
    return await KingbobContract.getReferrer(provider, address);
  } catch (error) {
    console.error('Error getting referrer:', error);
    return null;
  }
};

// Get claim status from contract
export const getUserClaimStatus = async (address: string) => {
  try {
    const provider = getProvider();
    return await KingbobContract.getClaimStatus(provider, address);
  } catch (error) {
    console.error('Error getting claim status:', error);
    return false;
  }
};

// Purchase package
export const purchasePackage = async (packageId: string, address: string) => {
  const selectedPackage = PACKAGES.find(p => p.id === packageId);
  if (!selectedPackage) throw new Error('Invalid package');
  
  const provider = getProvider();
  const signer = await provider.getSigner();
  
  try {
    // Get referrer from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = urlParams.get('ref');
    
    // Call contract to purchase package
    console.log(`Purchasing package ${packageId} for ${selectedPackage.priceBNB} BNB`);
    const receipt = await KingbobContract.buyPackage(
      signer, 
      packageId, 
      selectedPackage.priceBNB,
      referrer || undefined
    );
    
    console.log('Purchase transaction successful:', receipt.hash);
    
    // Store minimal information in Firestore for UI purposes
    const userRef = doc(db, usersCollection, address);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Update user record in Firestore
      await updateDoc(userRef, {
        package: packageId,
        purchasedAt: new Date().toISOString(),
        txHash: receipt.hash
      });
    } else {
      // Create new user record
      await setDoc(userRef, {
        address,
        package: packageId,
        purchasedAt: new Date().toISOString(),
        txHash: receipt.hash
      });
    }
    
    return receipt.hash;
  } catch (error) {
    console.error('Error purchasing package:', error);
    throw error;
  }
};

// Claim tokens function
export const claimTokens = async (address: string) => {
  if (!window.ethereum) throw new Error('MetaMask not detected');
  
  try {
    // Check if user exists in Firestore
    const userRef = doc(db, usersCollection, address);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    // Check if claiming is enabled globally using the contract
    const provider = getProvider();
    const isClaimEnabled = await KingbobContract.getGlobalClaimStatus(provider);
    if (!isClaimEnabled) {
      throw new Error('Claiming is not enabled yet');
    }
    
    // Check if user has already claimed using the contract
    const hasUserClaimed = await KingbobContract.getClaimStatus(provider, address);
    if (hasUserClaimed) {
      throw new Error('You have already claimed your tokens');
    }
    
    // Get signer for the transaction
    const signer = await provider.getSigner();
    
    // Call the contract to claim tokens
    console.log('Claiming tokens for address:', address);
    const receipt = await KingbobContract.claimTokens(signer);
    console.log('Claim transaction successful:', receipt.hash);
    
    // Update Firestore for UI purposes
    await updateDoc(userRef, {
      claimedAt: new Date().toISOString(),
      claimTxHash: receipt.hash
    });
    
    return {
      success: true,
      message: 'Tokens claimed successfully',
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Error claiming tokens:', error);
    throw error;
  }
};

// Check if claiming is enabled globally
export const checkClaimStatus = async () => {
  try {
    const provider = getProvider();
    return await KingbobContract.getGlobalClaimStatus(provider);
  } catch (error) {
    console.error('Error checking claim status:', error);
    return false;
  }
};

// Refill package
export const refillPackage = async (packageId: string, address: string) => {
  if (!window.ethereum) throw new Error('MetaMask not detected');
  
  try {
    const provider = getProvider();
    const signer = await provider.getSigner();
    
    // Get current refill count from contract
    const refillCount = await KingbobContract.getRefillCount(provider, address);
    if (parseInt(refillCount) <= 0) {
      throw new Error('No refills available');
    }
    
    // Call contract to refill package
    console.log(`Refilling package ${packageId} for address ${address}`);
    const receipt = await KingbobContract.refillPackage(signer, packageId);
    console.log('Refill transaction successful:', receipt.hash);
    
    // Update Firestore for UI purposes
    const userRef = doc(db, usersCollection, address);
    await updateDoc(userRef, {
      lastRefillAt: new Date().toISOString(),
      refillTxHash: receipt.hash
    });
    
    return {
      success: true,
      message: 'Package refilled successfully',
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Error refilling package:', error);
    throw error;
  }
};
