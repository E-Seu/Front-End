import React from 'react';
import Svg, { Rect, Text } from 'react-native-svg';

const PlaceholderIcon = ({ isActive = false, width = 57, height = 47, name = "Icon" }) => {
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
        fill={isActive ? "#D9C0E7" : "#F0F0F0"}
        stroke={isActive ? "#4E0777" : "#CCCCCC"}
        strokeWidth="1"
      />
      <Text 
        x="28.5" 
        y="27" 
        textAnchor="middle" 
        fontSize="10" 
        fill={isActive ? "#4E0777" : "#666666"}
      >
        {name}
      </Text>
    </Svg>
  );
};

export default PlaceholderIcon;