// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, usersCollection } from '../firebase';
import { toast } from 'react-hot-toast';
import { getTokenBalance, getRefillCount, getUserClaimStatus, checkClaimStatus, claimTokens } from '../utils/ethersHelpers';

// Package definitions
const PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    priceBNB: '0.01',
    tokenAmount: 1000,
    refillCount: 0
  },
  {
    id: 'standard',
    name: 'Standard',
    priceBNB: '0.05',
    tokenAmount: 5000,
    refillCount: 4
  },
  {
    id: 'premium',
    name: 'Premium',
    priceBNB: '0.1',
    tokenAmount: 10000,
    refillCount: 8
  }
];

interface DashboardSectionProps {
  userAddress: string;
}

interface UserData {
  address: string;
  package: string | null;
  tokenBalance: number;
  refillCount: number;
  refillsUsed: number;
  claimEnabled: boolean;
  referralRewards: number;
  claimed?: boolean;
  claimedAt?: string;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ userAddress }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claimEnabled, setClaimEnabled] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);
  
  // Contract data states
  const [refillCount, setRefillCount] = useState<string>('0');
  const [hasClaimedTokens, setHasClaimedTokens] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userAddress) return;
      
      try {
        // Get user data from Firestore
        const userRef = doc(db, usersCollection, userAddress);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data() as UserData;
          setUserData(data);
          
          // Package information is displayed directly from userData
          // No need to set selected package separately
        } else {
          setUserData(null);
        }
        
        // Fetch data from smart contract
        const [tokenBal, refillCnt, claimStatus, globalClaimStatus] = await Promise.all([
          getTokenBalance(userAddress),
          getRefillCount(userAddress),
          getUserClaimStatus(userAddress),
          checkClaimStatus()
        ]);
        
        // Update state with contract data
        setRefillCount(refillCnt);
        setHasClaimedTokens(claimStatus);
        
        // Enable claim button if global claiming is enabled and user hasn't claimed
        setClaimEnabled(globalClaimStatus && !claimStatus);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching your data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchUserData, 30000);
    
    return () => clearInterval(intervalId);
  }, [userAddress]);

  const getUserPackage = () => {
    if (!userData || !userData.package) return null;
    return PACKAGES.find(pkg => pkg.id === userData.package);
  };
  
  const handleClaim = async () => {
    if (isClaiming || !claimEnabled || hasClaimedTokens) return;
    
    setIsClaiming(true);
    try {
      const result = await claimTokens(userAddress);
      toast.success('Tokens claimed successfully!');
      console.log('Claim transaction:', result);
      
      // Update claim status
      setHasClaimedTokens(true);
      setClaimEnabled(false);
    } catch (error: any) {
      console.error('Error claiming tokens:', error);
      toast.error(error.message || 'Error claiming tokens. Please try again later.');
    } finally {
      setIsClaiming(false);
    }
  };
  
  // Refill functionality is currently disabled in the UI
  // Commented out as it's not used in the current UI
  /* 
  const handleRefill = async () => {
    if (isRefilling || !userData?.package || parseInt(refillCount) <= 0) return;
    
    setIsRefilling(true);
    try {
      const result = await refillPackage(userData.package, userAddress);
      toast.success('Package refilled successfully!');
      console.log('Refill transaction:', result);
      
      // Update refill count
      const newRefillCount = await getRefillCount(userAddress);
      setRefillCount(newRefillCount);
    } catch (error: any) {
      console.error('Error refilling package:', error);
      toast.error(error.message || 'Error refilling package. Please try again later.');
    } finally {
      setIsRefilling(false);
    }
  };
  */

  if (!userAddress) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-red-800 mb-4">Your Dashboard</h2>
          <p className="text-gray-600 mb-8">Connect your wallet to view your dashboard</p>
        </div>
      </section>
    );
  }

  const userPackage = getUserPackage();

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-red-800 mb-8">Your Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Package Information */}
          <div className="bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
            <h3 className="text-xl font-bold text-red-800 mb-4">Package Information</h3>
            
            {userData?.package ? (
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-bold">{userPackage?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Price Paid:</span>
                  <p className="text-sm text-gray-500">${parseFloat(userPackage?.priceBNB || '0') * 300} USD</p>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Tokens Purchased:</span>
                  <span className="font-bold">{userPackage?.tokenAmount?.toLocaleString() || 0}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No package purchased yet</p>
              </div>
            )}
          </div>
          
          {/* Token Balance */}
          <div className="bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
            <h3 className="text-xl font-bold text-red-800 mb-4">Token Balance</h3>
            
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-yellow-600 mb-2">
                {(userData?.tokenBalance || 0).toLocaleString()}
              </p>
              <p className="text-gray-600">Total Tokens</p>
              
              {userData && userData.referralRewards > 0 && (
                <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Includes <span className="font-bold">{userData.referralRewards}</span> tokens from referrals
                  </p>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={handleClaim}
                  disabled={!claimEnabled || isClaiming}
                  className={`w-full py-3 px-4 rounded-lg font-bold shadow-md transition-all duration-300 ${claimEnabled ? 'bg-gradient-to-r from-red-700 to-yellow-500 text-white hover:from-red-600 hover:to-yellow-400' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  {isClaiming ? 'Claiming...' : 'Claim Tokens'}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  {userData?.claimed ? 'Tokens already claimed' : claimEnabled ? 'Claiming is now enabled!' : 'Claiming will be enabled after launch'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;
