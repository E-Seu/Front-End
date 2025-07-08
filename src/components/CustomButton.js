import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ 
  title, 
  onPress, 
  variant = 'primary', // 'primary', 'outline', 'secondary'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  style,
  textStyle 
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'primary':
        return [...baseStyle, styles.primaryButton];
      case 'outline':
        return [...baseStyle, styles.outlineButton];
      case 'secondary':
        return [...baseStyle, styles.secondaryButton];
      default:
        return [...baseStyle, styles.primaryButton];
    }
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText, styles[`${size}Text`]];
    
    switch (variant) {
      case 'primary':
        return [...baseStyle, styles.primaryText];
      case 'outline':
        return [...baseStyle, styles.outlineText];
      case 'secondary':
        return [...baseStyle, styles.secondaryText];
      default:
        return [...baseStyle, styles.primaryText];
    }
  };

  return (
    <TouchableOpacity
      style={[
        ...getButtonStyle(),
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[...getTextStyle(), textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  
  small: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  medium: {
    paddingVertical: 20, 
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 22,
    paddingHorizontal: 28,
  },
  
  // Variantes do botão
  primaryButton: {
    backgroundColor: '#F03800', // Laranja
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF', // Borda branca
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#F03800', // Borda laranja
  },
  
  // Texto base
  buttonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Tamanhos do texto (removidos pois agora usamos fontSize fixo de 16)
  smallText: {},
  mediumText: {},
  largeText: {},
  
  // Cores do texto
  primaryText: {
    color: '#FFF', // Letra branca
  },
  outlineText: {
    color: '#FFF', // Letra branca
  },
  secondaryText: {
    color: '#F03800', // Letra laranja (esta mantém a cor laranja)
  },
  
  // Estado desabilitado
  disabled: {
    opacity: 0.5,
  },
});

export default CustomButton;