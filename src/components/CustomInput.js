import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

const CustomInput = ({ 
  placeholder,
  label, // Nova prop para o título
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  style,
  inputStyle,
  labelStyle,
  ...props
}) => {
  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      <View style={styles.container}>
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          placeholderTextColor="#999999"
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#888888',
    fontFamily: 'Nunito-Medium',
    marginBottom: 8,
    textAlign: 'left',
  },
  container: {
    display: 'flex',
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D9C0E7',
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Nunito-Regular',
    height: '100%',
    textAlign: 'left',
    textAlignVertical: 'center',
  },
});

export default CustomInput;