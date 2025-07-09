import React from 'react';
import Svg, { G, Path, Defs, Filter, FeFlood, FeColorMatrix, FeOffset, FeGaussianBlur, FeComposite, FeBlend, ClipPath, Rect } from 'react-native-svg';

const CoracaoIcon = ({ isActive = false, width = 50, height = 50 }) => {
  if (isActive) {
    // Versão ativa (preenchida)
    return (
   <Svg 
        width={width} 
        height={height} 
        viewBox="0 0 50 49" 
        fill="none"
      >
        {/* Sombra - mesmo path deslocado */}
       <Path 
          d="M4.08331 20.6546C4.08331 30.5832 12.2908 35.8732 18.2974 40.6098C20.4166 42.2799 22.4583 43.8541 24.5 43.8541C26.5416 43.8541 28.5833 42.282 30.7026 40.6078C36.7112 35.8752 44.9166 30.5832 44.9166 20.6566C44.9166 10.73 33.6875 3.68426 24.5 13.2311C15.3125 3.68426 4.08331 10.726 4.08331 20.6546Z" 
          fill="#000000" 
          fillOpacity="0.3"
        />
        {/* Coração principal */}
        <Path 
          d="M4.08331 18.6546C4.08331 28.5832 12.2908 33.8732 18.2974 38.6098C20.4166 40.2799 22.4583 41.8541 24.5 41.8541C26.5416 41.8541 28.5833 40.282 30.7026 38.6078C36.7112 33.8752 44.9166 28.5832 44.9166 18.6566C44.9166 8.73005 33.6875 1.68426 24.5 11.2311C15.3125 1.68426 4.08331 8.72597 4.08331 18.6546Z" 
          fill="#D00000" 
          fillOpacity="0.96"
        />
      </Svg>
    );
  } else {
    // Versão inativa (sem preenchimento)
    return (
      <Svg 
        width={width} 
        height={height} 
        viewBox="0 0 50 49" 
        fill="none"
      >
        <Path 
          d="M4.58331 18.6546C4.58331 28.5832 12.7908 33.8732 18.7974 38.6098C20.9166 40.2799 22.9583 41.8541 25 41.8541C27.0416 41.8541 29.0833 40.282 31.2026 38.6078C37.2112 33.8752 45.4166 28.5832 45.4166 18.6566C45.4166 8.73005 34.1875 1.68426 25 11.2311C15.8125 1.68426 4.58331 8.72597 4.58331 18.6546Z" 
          fill="#F2F2F2"
        />
      </Svg>
    );
  }
};

export default CoracaoIcon;