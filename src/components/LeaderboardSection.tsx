import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db, usersCollection } from '../firebase';
import { calculateTokenPrice } from '../utils/ethersHelpers';
import crownImage from '../assets/bobcoin-crown.svg';

interface LeaderboardUser {
  address: string;
  referralCount: number;
  referralRewards: number;
}

const LeaderboardSection: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'count' | 'value'>('count');

  // Calculate token value in USD
  const calculateTokenValue = (tokenAmount: number) => {
    const tokenPrice = calculateTokenPrice();
    return (tokenAmount * tokenPrice * 400).toFixed(2); // Assuming BNB price is $400
  };

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        
        // Only include users who have made at least one referral
        const leaderboardQuery = query(
          collection(db, usersCollection),
          where(activeTab === 'count' ? 'referralCount' : 'referralRewards', '>', 0),
          orderBy(activeTab === 'count' ? 'referralCount' : 'referralRewards', 'desc'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(leaderboardQuery);
        const users: LeaderboardUser[] = [];
        
        querySnapshot.forEach((doc) => {
          const userData = doc.data() as LeaderboardUser;
          users.push({
            address: doc.id,
            referralCount: userData.referralCount || 0,
            referralRewards: userData.referralRewards || 0
          });
        });
        
        setLeaderboardData(users);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [activeTab]);

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="bg-gradient-to-r from-red-900 to-red-700 text-white p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Referral Leaderboard</h2>
      
      {/* Tabs */}
      <div className="flex mb-6">
        <button
          className={`flex-1 py-2 text-center ${activeTab === 'count' ? 'bg-yellow-600 text-white' : 'bg-red-800 text-gray-300'} rounded-l-lg`}
          onClick={() => setActiveTab('count')}
        >
          Top by Referral Count
        </button>
        <button
          className={`flex-1 py-2 text-center ${activeTab === 'value' ? 'bg-yellow-600 text-white' : 'bg-red-800 text-gray-300'} rounded-r-lg`}
          onClick={() => setActiveTab('value')}
        >
          Top by Referral Value
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading leaderboard data...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-red-800 rounded-lg overflow-hidden">
            <thead className="bg-red-900">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-yellow-200">Rank</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-yellow-200">Wallet</th>
                {activeTab === 'count' ? (
                  <th className="py-3 px-4 text-right text-sm font-medium text-yellow-200">Referrals</th>
                ) : (
                  <th className="py-3 px-4 text-right text-sm font-medium text-yellow-200">Tokens Earned</th>
                )}
                <th className="py-3 px-4 text-right text-sm font-medium text-yellow-200">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-700">
              {leaderboardData.map((user, index) => (
                <tr key={user.address} className={index < 3 ? 'bg-red-700 bg-opacity-50' : 'hover:bg-red-700'}>
                  <td className="py-3 px-4 text-sm">
                    {index === 0 && (
                      <img src={crownImage} alt="Crown" className="inline-block w-5 h-5 mr-1" />
                    )}
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-sm font-mono">{formatAddress(user.address)}</td>
                  {activeTab === 'count' ? (
                    <td className="py-3 px-4 text-right text-sm font-medium">{user.referralCount}</td>
                  ) : (
                    <td className="py-3 px-4 text-right text-sm font-medium">{user.referralRewards}</td>
                  )}
                  <td className="py-3 px-4 text-right text-sm text-yellow-200">
                    ${calculateTokenValue(user.referralRewards)}
                  </td>
                </tr>
              ))}
              
              {leaderboardData.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-300">
                    No referral data available yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-yellow-200">
        <p>Join the leaderboard by referring friends to KINGBOB!</p>
        <p className="mt-1">Top referrers will receive special rewards at launch 🎁</p>
      </div>
    </div>
  );
};

export default LeaderboardSection;
