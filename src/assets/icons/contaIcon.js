import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

const ContaIcon = ({ isActive = false, width = 57, height = 47 }) => {
  if (isActive) {
    // Versão com preenchimento
    return (
      <Svg 
        width={width} 
        height={height} 
        viewBox="0 0 57 47" 
        fill="none"
      >
        <Rect 
          x="0.5" 
          width="56" 
          height="47" 
          rx="15" 
          fill="#D9C0E7"
        />
        <Path 
          d="M28.5 19.75C32.6421 19.75 36 16.3921 36 12.25C36 8.10786 32.6421 4.75 28.5 4.75C24.3579 4.75 21 8.10786 21 12.25C21 16.3921 24.3579 19.75 28.5 19.75Z" 
          fill="#4E0777"
        />
        <Path 
          opacity="0.5" 
          d="M43.5 33.8125C43.5 38.4719 43.5 42.25 28.5 42.25C13.5 42.25 13.5 38.4719 13.5 33.8125C13.5 29.1531 20.2162 25.375 28.5 25.375C36.7838 25.375 43.5 29.1531 43.5 33.8125Z" 
          fill="#4E0777"
        />
      </Svg>
    );
  } else {
    // Versão sem preenchimento
    return (
      <Svg 
        width={width} 
        height={height} 
        viewBox="0 0 45 45" 
        fill="none"
      >
        <Path 
          d="M22.5 18.75C26.6421 18.75 30 15.3921 30 11.25C30 7.10786 26.6421 3.75 22.5 3.75C18.3579 3.75 15 7.10786 15 11.25C15 15.3921 18.3579 18.75 22.5 18.75Z" 
          stroke="#4E0777" 
          strokeWidth="1.5"
        />
        <Path 
          d="M37.4962 33.75C37.4987 33.4425 37.5 33.13 37.5 32.8125C37.5 28.1531 30.7838 24.375 22.5 24.375C14.2162 24.375 7.5 28.1531 7.5 32.8125C7.5 37.4719 7.5 41.25 22.5 41.25C26.6831 41.25 29.7 40.9556 31.875 40.4306" 
          stroke="#4E0777" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
      </Svg>
    );
  }
};

export default ContaIcon;
