import React from 'react';
import Svg, { Path } from 'react-native-svg';

const LocalizacaoIcon = ({ width = 24, height = 24, color = "#8B0BD5" }) => {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <Path 
        d="M5.875 12.573C5.308 11.25 5 9.84 5 8.515C5 4.917 8.134 2 12 2C15.866 2 19 4.917 19 8.515C19 12.085 16.766 16.25 13.28 17.74C12.8751 17.9116 12.4398 18.0001 12 18.0001C11.5602 18.0001 11.1249 17.9116 10.72 17.74C9.607 17.264 8.621 16.515 7.795 15.6" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      <Path 
        d="M14 9C14 9.53043 13.7893 10.0391 13.4142 10.4142C13.0391 10.7893 12.5304 11 12 11C11.4696 11 10.9609 10.7893 10.5858 10.4142C10.2107 10.0391 10 9.53043 10 9C10 8.46957 10.2107 7.96086 10.5858 7.58579C10.9609 7.21071 11.4696 7 12 7C12.5304 7 13.0391 7.21071 13.4142 7.58579C13.7893 7.96086 14 8.46957 14 9Z" 
        stroke={color} 
        strokeWidth="1.5"
      />
      <Path 
        d="M20.96 15.5C21.626 16.102 22 16.782 22 17.5C22 18.425 21.38 19.285 20.316 20M3.04 15.5C2.374 16.102 2 16.782 2 17.5C2 19.985 6.477 22 12 22C13.653 22 15.212 21.82 16.586 21.5" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default LocalizacaoIcon;