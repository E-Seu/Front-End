import React from 'react';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';

const ConcluidoIcon = ({ width = 150, height = 150, color = "#FF7F23" }) => {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 150 150" 
      fill="none"
    >
      <Defs>
        <ClipPath id="clip0_219_2453">
          <Rect width="150" height="150" fill="white"/>
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0_219_2453)">
        <Path 
          d="M56.25 75.5L68.75 87.5L93.75 62.5" 
          stroke={color} 
          strokeWidth="9.375" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <Path 
          d="M106.25 20.8625C96.7534 15.367 85.972 12.4819 75 12.5C40.4813 12.5 12.5 40.4812 12.5 75C12.5 85 14.85 94.45 19.0187 102.831C20.1312 105.056 20.5 107.6 19.8563 110.006L16.1375 123.919C15.7692 125.296 15.7695 126.745 16.1385 128.122C16.5074 129.498 17.232 130.754 18.2395 131.762C19.2469 132.77 20.5019 133.495 21.8783 133.865C23.2547 134.235 24.7042 134.236 26.0812 133.869L39.9938 130.144C42.4086 129.534 44.9634 129.829 47.175 130.975C55.8184 135.278 65.3445 137.512 75 137.5C109.519 137.5 137.5 109.519 137.5 75C137.5 63.6187 134.456 52.9375 129.138 43.75" 
          stroke={color} 
          strokeWidth="9.375" 
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
};

export default ConcluidoIcon;