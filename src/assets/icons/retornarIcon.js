import React from 'react';
import Svg, { Path } from 'react-native-svg';

const RetornarIcon = ({ width = 24, height = 24 }) => {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <Path 
        d="M15 19L9 12L10.5 10.25M15 5L13 7.333" 
        stroke="#4E0777" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default RetornarIcon;