import React from 'react';
import WalletConnect from './WalletConnect';

interface HeroSectionProps {
  onConnect: (address: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onConnect }) => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-yellow-700 opacity-90"></div>
      
      {/* Crown pattern overlay */}
      <div className="absolute inset-0 bg-[url('/crown-pattern.png')] bg-repeat opacity-10"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              <span className="block">KINGBOB Presale</span>
              <span className="block text-yellow-300">Token Launch</span>
            </h1>
            
            <p className="text-xl text-yellow-100 mb-8 max-w-lg">
              Secure your position in our exclusive presale. Connect your wallet and choose your royal package today.
            </p>
            
            <div className="flex justify-center md:justify-start space-x-4">
              <WalletConnect onConnect={onConnect} />
              
              <button 
                onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-red-800 font-bold py-2 px-6 rounded-full shadow-lg hover:bg-yellow-100 transition-all duration-300 transform hover:scale-105"
              >
                View Packages
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className="relative">
              {/* KingBob logo */}
              <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-4 border-red-800 relative">
                <img 
                  src="/bobcoi-n-removebg-preview.png" 
                  alt="KingBob Logo" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-300 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-red-600 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
        
        {/* Stats section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 text-center">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-3xl font-bold text-yellow-300">4</p>
            <p className="text-sm text-yellow-100">Royal Packages</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-3xl font-bold text-yellow-300">$20</p>
            <p className="text-sm text-yellow-100">Referral Reward</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-3xl font-bold text-yellow-300">13,000</p>
            <p className="text-sm text-yellow-100">Max Tokens</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-3xl font-bold text-yellow-300">BNB</p>
            <p className="text-sm text-yellow-100">Payment Method</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
