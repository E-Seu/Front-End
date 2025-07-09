import React from 'react';
import Svg, { G, Path, Defs, Filter, FeFlood, FeColorMatrix, FeOffset, FeGaussianBlur, FeComposite, FeBlend, ClipPath, Rect } from 'react-native-svg';

const CoracaoIcon = ({ isActive = false, width = 50, height = 50 }) => {
  if (isActive) {
    // Versão ativa (preenchida)
    return (
      <Svg 
        width={width} 
        height={height} 
        viewBox="0 0 50 50" 
        fill="none"
      >
        <G clipPath="url(#clip0_500_1043)" filter="url(#filter0_d_500_1043)">
          <G filter="url(#filter1_d_500_1043)">
            <Path 
              d="M4.58331 18.6546C4.58331 28.5832 12.7908 33.8732 18.7974 38.6098C20.9166 40.2799 22.9583 41.8541 25 41.8541C27.0416 41.8541 29.0833 40.282 31.2026 38.6078C37.2112 33.8752 45.4166 28.5832 45.4166 18.6566C45.4166 8.73005 34.1875 1.68426 25 11.2311C15.8125 1.68426 4.58331 8.72597 4.58331 18.6546Z" 
              fill="#D00000" 
              fillOpacity="0.96" 
              shapeRendering="crispEdges"
            />
          </G>
        </G>
        <Defs>
          <Filter id="filter0_d_500_1043" x="-3.5" y="0" width="57" height="57" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix"/>
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <FeOffset dy="4"/>
            <FeGaussianBlur stdDeviation="2"/>
            <FeComposite in2="hardAlpha" operator="out"/>
            <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_500_1043"/>
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_500_1043" result="shape"/>
          </Filter>
          <Filter id="filter1_d_500_1043" x="4.58331" y="6.7063" width="44.8333" height="39.1477" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <FeFlood floodOpacity="0" result="BackgroundImageFix"/>
            <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <FeOffset dx="2" dy="2"/>
            <FeGaussianBlur stdDeviation="1"/>
            <FeComposite in2="hardAlpha" operator="out"/>
            <FeColorMatrix type="matrix" values="0 0 0 0 0.6875 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_500_1043"/>
            <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_500_1043" result="shape"/>
          </Filter>
          <ClipPath id="clip0_500_1043">
            <Rect width="49" height="49" fill="white" transform="translate(0.5)"/>
          </ClipPath>
        </Defs>
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