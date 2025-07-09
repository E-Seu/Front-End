import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image,
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const LoginModal = ({ visible, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, loading, quickLogin } = useAuth();
  
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
  if (visible) {
    // Animar entrada - mais lenta
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600, // Aumentado de 300 para 600ms
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 600, // Aumentado de 300 para 600ms
        useNativeDriver: true,
      }),
    ]).start();
  } else {
    // Animar saída - mais lenta
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 400, // Aumentado de 250 para 400ms
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 400, // Aumentado de 250 para 400ms
        useNativeDriver: true,
      }),
    ]).start();
  }
}, [visible]);

const closeModal = () => {
  Animated.parallel([
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 400, // Aumentado de 250 para 400ms
      useNativeDriver: true,
    }),
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 400, // Aumentado de 250 para 400ms
      useNativeDriver: true,
    }),
  ]).start(() => {
    onClose();
    setEmail('');
    setPassword('');
  });
};
    const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos');
        return;
    }

    const result = await login(email.trim(), password);
    
    if (result.success) {
        Alert.alert(
        'Sucesso!', 
        `Bem-vindo(a), ${result.user.nome}!`, // Mudado de result.user.name para result.user.nome
        [{ text: 'OK', onPress: closeModal }]
        );
    } else {
        Alert.alert('Erro', result.error);
    }
    };

  const handleQuickLogin = (userType) => {
    quickLogin(userType);
    closeModal();
  };

  const fillUserData = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={closeModal}
    >
      {/* Overlay escuro */}
      <Animated.View 
        style={[styles.overlay, { opacity: overlayOpacity }]}
      >
        <TouchableOpacity 
          style={styles.overlayTouch} 
          onPress={closeModal}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Handle do modal */}
          <View style={styles.handle} />
          
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          <Image 
              source={require('../assets/images/Logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
          />      
          <Text style={styles.subtitle}>Entre! O resto a gente entrega 😎  </Text>  
            <CustomInput
              label="Email" // Título acima do input
              placeholder="Digite seu email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              style={styles.customInputContainer}
            />
            
            <CustomInput
              label="Senha" // Título acima do input
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              editable={!loading}
              style={styles.customInputContainer}
            />
            
            <CustomButton
              title={loading ? '' : 'Entrar'}
              variant="primary"
              size="small"
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
            >
              {loading && <ActivityIndicator color="white" />}
            </CustomButton>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
   overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F03800',
  },
  overlayTouch: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    height: screenHeight * 0.80,
  },
  keyboardView: {
    flex: 1,
  },
  handle: {
    width: 80,
    height: 4,
    backgroundColor: '#D9C0E7',
    alignSelf: 'center',
    marginTop: 12,
    borderRadius: 30,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Medium',
    textAlign: 'center',
    marginBottom: 30,
    color: '#4F0072',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickLoginButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  quickButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loginButton: {
    width: '80%',
    alignSelf: 'center',
  },
  customInputContainer: {
    width: '100%',
  },
  logoImage: {
    width: 299,
    height: 189,
    alignSelf: 'center',
    marginTop: 20,
  }
});

export default LoginModal;