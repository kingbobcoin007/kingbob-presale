import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import HeroSection from './components/HeroSection';
import PackagesSection from './components/PackagesSection';
import ReferralSection from './components/ReferralSection';
import LeaderboardSection from './components/LeaderboardSection';
import DashboardSection from './components/DashboardSection';
import AdminPanel from './components/AdminPanel';

// Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { auth, initializeFirestore } from './firebase';

const App: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Initialize Firestore with appropriate settings for local/production environment
    initializeFirestore().catch(err => {
      console.error('Failed to initialize Firestore:', err);
    });
    
    // Check for admin authentication status
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User authenticated' : 'User not authenticated');
      setIsAdmin(!!user);
      
      // Store authentication status in localStorage as a fallback
      if (user) {
        localStorage.setItem('kingbob_admin_auth', 'true');
      } else {
        localStorage.removeItem('kingbob_admin_auth');
      }
    });

    // Check localStorage as a fallback for page refreshes
    const hasLocalAuth = localStorage.getItem('kingbob_admin_auth') === 'true';
    if (hasLocalAuth) {
      setIsAdmin(true);
    }

    return () => unsubscribe();
  }, []);

  const handleWalletConnect = (address: string) => {
    setUserAddress(address);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
        <Toaster position="top-right" />
        
        {/* Navigation */}
        <nav className="bg-gradient-to-r from-red-900 to-yellow-700 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center group">
                  <div className="w-8 h-8 mr-2 rounded-full overflow-hidden border-2 border-yellow-300 flex-shrink-0 group-hover:animate-spin transition-transform duration-1000">
                    <img 
                      src="/bobcoi-n-removebg-preview.png" 
                      alt="KINGBOB Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-bold text-xl tracking-wide">KINGBOB Presale</span>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link to="/" className="hover:text-yellow-200 transition-colors">Home</Link>
                <Link to="/dashboard" className="hover:text-yellow-200 transition-colors">Dashboard</Link>
                <Link to="/leaderboard" className="hover:text-yellow-200 transition-colors">Leaderboard</Link>
                {isAdmin && (
                  <Link to="/admin" className="hover:text-yellow-200 transition-colors">Admin</Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={
              <div>
                <HeroSection onConnect={handleWalletConnect} />
                <div id="packages">
                  <PackagesSection userAddress={userAddress} />
                </div>
                <ReferralSection userAddress={userAddress} />
              </div>
            } />
            
            <Route path="/dashboard" element={
              <DashboardSection userAddress={userAddress} />
            } />
            
            <Route path="/leaderboard" element={
              <LeaderboardSection />
            } />
            
            <Route path="/admin" element={
              <AdminPanel />
            } />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="bg-gradient-to-r from-red-900 to-yellow-700 text-white py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-2 rounded-full overflow-hidden border border-yellow-300 flex-shrink-0">
                    <img 
                      src="/kingbob-favicon.png" 
                      alt="KINGBOB Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-bold">KINGBOB Presale</span>
                </div>
                <p className="text-sm text-yellow-200 mt-2">Secure your position in our exclusive token launch</p>
              </div>
              
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-yellow-200 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-yellow-200 transition-colors">
                  <span className="sr-only">Telegram</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.657-.64.134-.954l11.59-4.47c.538-.196 1.006.128.83.952z" />
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-yellow-200 transition-colors">
                  <span className="sr-only">Discord</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="mt-8 border-t border-red-800 pt-6 text-center text-sm text-yellow-200">
              <p>&copy; 2025 KINGBOB Presale. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
