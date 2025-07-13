import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import RetornarIcon from '../assets/icons/retornarIcon';
import LinearGradient from 'react-native-linear-gradient';

const RegisterScreen = ({ navigation }) => {
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleUserTypeSelect = (userType) => {
    console.log('Tipo de usuário selecionado:', userType);
    
    switch(userType) {
      case 'cliente':
        navigation.navigate('RegisterCliente');
        break;
      case 'entregador':
        navigation.navigate('RegisterEntregador');
        break;
      case 'restaurante':
        navigation.navigate('RegisterRestauranteType'); // Tela para escolher Fixo ou Ambulante
        break;
      default:
        console.log('Tipo não reconhecido');
    }
  };

  return (
    <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackPress}
            >
              <RetornarIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>
              Vamos começar! Primeiro, nos diga quem é você:
            </Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.userTypeButton}
                onPress={() => handleUserTypeSelect('cliente')}
                activeOpacity={0.8}
              >
                <Text style={styles.userTypeText}>Cliente</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.userTypeButton}
                onPress={() => handleUserTypeSelect('entregador')}
                activeOpacity={0.8}
              >
                <Text style={styles.userTypeText}>Entregador</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.userTypeButton}
                onPress={() => handleUserTypeSelect('restaurante')}
                activeOpacity={0.8}
              >
                <Text style={styles.userTypeText}>Restaurante</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEDCF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito-SemiBold',
    color: '#4F0072',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
    marginBottom: 100,
  },
  userTypeButton: {
    width: 318,
    height: 53,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#EA9459',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTypeText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#F03800',
  },
});

export default RegisterScreen;