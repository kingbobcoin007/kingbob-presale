// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db, usersCollection } from '../firebase';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  address: string;
  package: string | null;
  tokenBalance: number;
  refillCount: number;
  referralRewards: number;
  claimEnabled: boolean;
  createdAt: string;
}

const AdminPanel: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [globalClaimEnabled, setGlobalClaimEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof User>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Primary authentication check using Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isAuthed = !!user;
      setIsAuthenticated(isAuthed);
      
      if (isAuthed) {
        // User is authenticated, fetch data
        fetchUsers();
        fetchSettings();
        // Store authentication in localStorage as fallback
        localStorage.setItem('kingbob_admin_auth', 'true');
      } else {
        // Clear localStorage if not authenticated
        localStorage.removeItem('kingbob_admin_auth');
      }
    });
    
    // Fallback check using localStorage for page refreshes
    const hasLocalAuth = localStorage.getItem('kingbob_admin_auth') === 'true';
    if (hasLocalAuth && !isAuthenticated) {
      setIsAuthenticated(true);
      fetchUsers();
      fetchSettings();
    }
    
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Hardcoded admin credentials for testing
      if (email === 'kenesistele18@gmail.com' && password === 'Toby@2018') {
        // Skip Firebase auth and use local authentication
        setIsAuthenticated(true);
        localStorage.setItem('kingbob_admin_auth', 'true');
        fetchUsers();
        fetchSettings();
      } else {
        // Try Firebase auth as fallback
        try {
          await signInWithEmailAndPassword(auth, email, password);
          setIsAuthenticated(true);
          fetchUsers();
          fetchSettings();
        } catch (firebaseErr) {
          throw new Error('Invalid email or password');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, usersCollection), orderBy(sortField, sortDirection));
      const querySnapshot = await getDocs(q);
      
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data(),
        } as User);
      });
      
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const configRef = doc(db, 'config', 'claimSettings');
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        setGlobalClaimEnabled(configSnap.data().claimActive || false);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const toggleGlobalClaim = async () => {
    try {
      const configRef = doc(db, 'config', 'claimSettings');
      await setDoc(configRef, {
        claimActive: !globalClaimEnabled,
        updatedAt: new Date().toISOString()
      });
      
      setGlobalClaimEnabled(!globalClaimEnabled);
      toast.success(`Claim ${!globalClaimEnabled ? 'enabled' : 'disabled'} successfully!`);
      
      // Refresh user list
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update claim status');
      toast.error('Failed to update claim status');
    }
  };

  const toggleUserClaim = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, usersCollection, userId);
      await updateDoc(userRef, {
        claimEnabled: !currentStatus
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, claimEnabled: !currentStatus } : user
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to update user claim status');
    }
  };

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.address.toLowerCase().includes(query) ||
      (user.package && user.package.toLowerCase().includes(query))
    );
  });

  if (!isAuthenticated) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6 text-red-800">Admin Login</h2>
          
          <form onSubmit={handleLogin} className="bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-700 to-yellow-500 text-white py-2 rounded-lg font-bold shadow-md hover:from-red-600 hover:to-yellow-400 transition-all duration-300 disabled:opacity-70"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-red-800">Admin Panel</h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
        
        {/* Global Settings */}
        <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl shadow-lg border border-yellow-200">
          <h3 className="text-xl font-bold text-red-800 mb-4">Global Settings</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold">Token Claiming</h4>
              <p className="text-gray-600">
                {globalClaimEnabled ? 'Users can claim tokens' : 'Token claiming is disabled'}
              </p>
            </div>
            
            <button
              onClick={toggleGlobalClaim}
              className={`px-4 py-2 rounded-lg text-white font-medium ${
                globalClaimEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              } transition-colors`}
            >
              {globalClaimEnabled ? 'Disable Claiming' : 'Enable Claiming'}
            </button>
          </div>
        </div>
        
        {/* User Management */}
        <div className="p-6 bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl shadow-lg border border-yellow-200">
          <h3 className="text-xl font-bold text-red-800 mb-4">User Management</h3>
          
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by address or package..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-red-100 to-yellow-100">
                <tr>
                  <th 
                    className="py-3 px-4 text-left text-gray-700 cursor-pointer hover:bg-yellow-200"
                    onClick={() => handleSort('address')}
                  >
                    Address
                  </th>
                  <th 
                    className="py-3 px-4 text-center text-gray-700 cursor-pointer hover:bg-yellow-200"
                    onClick={() => handleSort('package')}
                  >
                    Package
                  </th>
                  <th 
                    className="py-3 px-4 text-center text-gray-700 cursor-pointer hover:bg-yellow-200"
                    onClick={() => handleSort('tokenBalance')}
                  >
                    Token Balance
                  </th>
                  <th 
                    className="py-3 px-4 text-center text-gray-700 cursor-pointer hover:bg-yellow-200"
                    onClick={() => handleSort('referralRewards')}
                  >
                    Referral Rewards
                  </th>
                  <th 
                    className="py-3 px-4 text-center text-gray-700 cursor-pointer hover:bg-yellow-200"
                    onClick={() => handleSort('claimEnabled')}
                  >
                    Claim Status
                  </th>
                  <th className="py-3 px-4 text-center text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-yellow-50">
                    <td className="py-3 px-4 font-mono text-sm">
                      {user.address.slice(0, 6)}...{user.address.slice(-4)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {user.package || 'None'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {user.tokenBalance?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {user.referralRewards?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.claimEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.claimEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleUserClaim(user.id, user.claimEnabled)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          user.claimEnabled ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-green-100 text-green-800 hover:bg-green-200'
                        } transition-colors`}
                      >
                        {user.claimEnabled ? 'Disable Claim' : 'Enable Claim'}
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPanel;
