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
import LoginService from '../services/LoginService';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const LoginModal = ({ visible, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animar entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animar saída
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 400,
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

    try {
      setLoading(true);
      console.log('🔐 Tentando fazer login com:', email.trim());
      
      const result = await login(email.trim(), password);
      
      if (result.success) {
        console.log('✅ Login bem-sucedido:', result.user);
        
        Alert.alert(
          'Sucesso!', 
          `Bem-vindo(a), ${result.user.nome}!`,
          [{ text: 'OK', onPress: closeModal }]
        );
      } else {
        console.log('❌ Erro no login:', result.error);
        Alert.alert('Erro', result.error || 'Falha no login');
      }
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
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
            
            <Text style={styles.subtitle}>Entre! O resto a gente entrega 😎</Text>
            
            <CustomInput
              label="Email"
              placeholder="Digite seu email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              style={styles.customInputContainer}
            />
            
            <CustomInput
              label="Senha"
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
    backgroundColor: 'rgba(240, 56, 0, 0.8)',
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
    height: screenHeight * 0.85,
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
  
  logoImage: {
    width: 299,
    height: 189,
    alignSelf: 'center',
    marginTop: 20,
  },
  
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Medium',
    textAlign: 'center',
    marginBottom: 30,
    color: '#4F0072',
  },
  
  customInputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  
  loginButton: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
  },
});

export default LoginModal;