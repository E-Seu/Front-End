import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import RetornarIcon from '../assets/icons/retornarIcon';

const RegisterRestauranteType = ({ navigation }) => {
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleRestauranteTypeSelect = (restauranteType) => {
    console.log('Tipo de restaurante selecionado:', restauranteType);
    
    switch(restauranteType) {
      case 'fixo':
        navigation.navigate('RegisterRestauranteFixo');
        break;
      case 'ambulante':
        navigation.navigate('RegisterRestauranteAmbulante');
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
            Nos diga o tipo de restaurante que você é:
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.typeButton}
              onPress={() => handleRestauranteTypeSelect('fixo')}
              activeOpacity={0.8}
            >
              <Text style={styles.typeText}>Fixo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.typeButton}
              onPress={() => handleRestauranteTypeSelect('ambulante')}
              activeOpacity={0.8}
            >
              <Text style={styles.typeText}>Ambulante</Text>
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
    fontFamily: 'Nunito-Regular',
    color: '#4F0072',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
    marginBottom: 100,
  },
  typeButton: {
    width: 318,
    height: 53,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#EA9459',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#F03800',
  },
});

export default RegisterRestauranteType;