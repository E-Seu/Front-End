import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const LoginModal = ({ visible, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMockUsers, setShowMockUsers] = useState(false);
  
  const { login, loading, mockUsers, quickLogin } = useAuth();
  
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animar entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animar saída
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // PanResponder para arrastar o modal para baixo
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy > 0 && gestureState.dy > gestureState.dx;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > screenHeight * 0.3) {
          // Se arrastou mais de 30% da tela, fecha o modal
          closeModal();
        } else {
          // Senão, volta para a posição original
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      // Reset dos campos quando fecha
      setEmail('');
      setPassword('');
      setShowMockUsers(false);
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
    setShowMockUsers(false);
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
        {...panResponder.panHandlers}
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
            <Text style={styles.title}>Login</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            {/* Seção de usuários mock para teste */}
            <View style={styles.mockSection}>
              <TouchableOpacity 
                style={styles.mockToggle}
                onPress={() => setShowMockUsers(!showMockUsers)}
              >
                <Text style={styles.mockToggleText}>
                  {showMockUsers ? '🔼 Ocultar' : '🔽 Mostrar'} Usuários de Teste
                </Text>
              </TouchableOpacity>

              {showMockUsers && (
                <View style={styles.mockContainer}>
                  <Text style={styles.mockTitle}>🚀 Login Rápido:</Text>
                  
                  <View style={styles.quickLoginButtons}>
                    <TouchableOpacity 
                      style={[styles.quickButton, styles.clienteButton]}
                      onPress={() => handleQuickLogin('cliente')}
                      disabled={loading}
                    >
                      <Text style={styles.quickButtonText}>Cliente</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.quickButton, styles.restauranteButton]}
                      onPress={() => handleQuickLogin('restaurante')}
                      disabled={loading}
                    >
                      <Text style={styles.quickButtonText}>Restaurante</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.quickButton, styles.entregadorButton]}
                      onPress={() => handleQuickLogin('entregador')}
                      disabled={loading}
                    >
                      <Text style={styles.quickButtonText}>Entregador</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Lista de usuários mock */}
                  <Text style={styles.mockSubtitle}>Ou clique em um usuário:</Text>
                  {mockUsers.map((user, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.mockUser, styles[`${user.type}Card`]]}
                      onPress={() => fillUserData(user.email, '123456')}
                    >
                      <Text style={styles.mockUserType}>{user.type.toUpperCase()}</Text>
                      <Text style={styles.mockUserEmail}>{user.email}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.9,
    minHeight: screenHeight * 0.6,
  },
  keyboardView: {
    flex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginTop: 12,
    borderRadius: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  button: {
    backgroundColor: '#4E0777',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mockSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
  },
  mockToggle: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  mockToggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  mockContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  mockTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  mockSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#666',
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
  clienteButton: {
    backgroundColor: '#28a745',
  },
  restauranteButton: {
    backgroundColor: '#fd7e14',
  },
  entregadorButton: {
    backgroundColor: '#6f42c1',
  },
  quickButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mockUser: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  clienteCard: {
    backgroundColor: '#d4edda',
    borderLeftColor: '#28a745',
  },
  restauranteCard: {
    backgroundColor: '#fff3cd',
    borderLeftColor: '#fd7e14',
  },
  entregadorCard: {
    backgroundColor: '#e2e3f1',
    borderLeftColor: '#6f42c1',
  },
  mockUserType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  mockUserEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

export default LoginModal;