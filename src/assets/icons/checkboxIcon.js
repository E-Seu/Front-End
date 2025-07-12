import React from 'react';
import Svg, { Path } from 'react-native-svg';

const CheckboxIcon = ({ isChecked = false, width = 24, height = 24 }) => {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      {/* Contorno da checkbox */}
      <Path 
        d="M22 12C22 16.714 22 19.071 20.535 20.535C19.072 22 16.714 22 12 22C7.286 22 4.929 22 3.464 20.535C2 19.072 2 16.714 2 12C2 7.286 2 4.929 3.464 3.464C4.93 2 7.286 2 12 2C16.714 2 19.071 2 20.535 3.464C21.509 4.438 21.835 5.807 21.945 8" 
        stroke="#A683BB" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      
      {/* Check mark (só aparece quando checado) */}
      {isChecked && (
        <Path 
          d="M8.5 12.5L10.5 14.5L15.5 9.5" 
          stroke="#FF7F23" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
};

export default CheckboxIcon;