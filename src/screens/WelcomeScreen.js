import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Image
} from 'react-native';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import LinearGradient from  'react-native-linear-gradient';
import CustomButton from '../components/CustomButton';

const WelcomeScreen = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  return (
 
    <View style={styles.container}>
      <LinearGradient
        colors={['#4F0072', '#9500D8']}
        style={styles.background}>
      <View style={styles.content}>
        <Image 
          source={require('../assets/images/Welcome.png')} 
          style={styles.welcomeImage}
          resizeMode="contain"
        />
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Fazer Login"
            variant="primary"
            size="small"
            onPress={() => setShowLoginModal(true)} // Abre modal de login
          />
          <CustomButton
            title="Criar Conta"
            variant="outline"
            size="small"
            onPress={() => setShowRegisterModal(true)} // Abre modal de cadastro
          />
        </View>
      </View>

      {/* Modal de Login */}
      <LoginModal 
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Modal de Registro */}
      <RegisterModal 
        visible={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
    welcomeImage: {
    width: 383.656,
    height: 406.504,
  },
  background: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    width: '304',
    gap: 15,
  },
});

export default WelcomeScreen;