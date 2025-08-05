import React from 'react';

const VibeIcon = ({ className = 'w-6 h-6', ...props }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="vibeIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#e0e7ff', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Main pulse/vibe wave - optimized for centering */}
      <path 
        d="M1 12 L3.5 12 L5 8 L7 16 L9 4 L11 20 L13 9 L15 15 L17 12 L19 8 L21 16 L22.5 12 L23 12" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Key data points highlighted */}
      <circle cx="9" cy="4" r="1.5" fill="currentColor" opacity="0.8"/>
      <circle cx="11" cy="20" r="1.5" fill="currentColor" opacity="0.6"/>
      <circle cx="21" cy="16" r="1.2" fill="currentColor" opacity="0.4"/>
      
      {/* Sparkle accent in corner */}
      <path 
        d="M2.5 2.5 L3 4 L4.5 4.5 L3 5 L2.5 6.5 L2 5 L0.5 4.5 L2 4 Z" 
        fill="currentColor" 
        opacity="0.5"
      />
      
      {/* Small bar chart elements in bottom right */}
      <rect x="20" y="18" width="1" height="3" fill="currentColor" opacity="0.4"/>
      <rect x="21.5" y="17" width="1" height="4" fill="currentColor" opacity="0.4"/>
      <rect x="23" y="19" width="1" height="2" fill="currentColor" opacity="0.4"/>
    </svg>
  );
};

export default VibeIcon; 