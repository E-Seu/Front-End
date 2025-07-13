import React from 'react';
import { View, StyleSheet, Image, SafeAreaView } from 'react-native';
import CustomButton from '../components/CustomButton';

const RegisterSucessScreen = ({ navigation }) => {
  const handleIrParaInicio = () => {
    navigation.navigate('Welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../assets/images/CadastroConcluidoImg.png')} 
          style={styles.successImage}
          resizeMode="contain"
        />
        
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Ir para o Início"
            variant="primary"
            size="small"
            onPress={handleIrParaInicio}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successImage: {
    width: 350,
    height: 350,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '80%',
  },
});

export default RegisterSucessScreen;