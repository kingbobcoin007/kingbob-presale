import React from 'react';

// This component renders a KingBob image directly using SVG
const KingBobImage: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Crown */}
      <path d="M40,120 L160,120 L140,60 L100,90 L60,60 Z" fill="#D4AF37" stroke="#8B4513" stroke-width="4"/>
      <path d="M60,60 L80,30 L100,60 L120,30 L140,60" fill="none" stroke="#8B4513" stroke-width="4"/>
      
      {/* Crown jewels */}
      <circle cx="80" cy="50" r="8" fill="#FF0000"/>
      <circle cx="100" cy="40" r="8" fill="#0000FF"/>
      <circle cx="120" cy="50" r="8" fill="#00FF00"/>
      
      {/* Bob character */}
      <circle cx="100" cy="150" r="30" fill="#FFD700"/>
      <circle cx="90" cy="140" r="5" fill="#000000"/> {/* Left eye */}
      <circle cx="110" cy="140" r="5" fill="#000000"/> {/* Right eye */}
      <path d="M85,160 Q100,170 115,160" fill="none" stroke="#000000" stroke-width="3"/> {/* Smile */}
      
      {/* Text */}
      <text x="100" y="190" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="#8B4513">KINGBOB</text>
    </svg>
  );
};

export default KingBobImage;
