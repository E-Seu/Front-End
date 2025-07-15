import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import mapaImage from '../../assets/images/uecemap.png';

const EntregadorHome = () => {
  const navigation = useNavigation();
  const [disponivel, setDisponivel] = useState(false);

  const handleToggleDisponivel = () => {
    setDisponivel((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.disponivelQuadro}>
        <TouchableOpacity
          style={[
            styles.disponivelBtn,
            {
              backgroundColor: disponivel ? '#FFF5EC' : '#F2F2F2',
              borderColor: disponivel ? '#FF9900' : '#CCCCCC',
              shadowColor: disponivel ? '#FF9900' : '#888',
            }
          ]}
          onPress={handleToggleDisponivel}
          activeOpacity={0.85}
        >
          <Text style={[
            styles.disponivelText,
            { color: disponivel ? '#FF9900' : '#888888' }
          ]}>
            {disponivel ? 'Disponível' : 'Indisponível'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mapaContainer}>
        <Image
          source={mapaImage}
          style={styles.mapaImage}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  disponivelQuadro: {
    marginTop: 0,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderColor: '#EEE',
    borderWidth: 1,
    borderTopWidth: 0,
    alignItems: 'center',
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  disponivelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  disponivelText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    letterSpacing: 0.2,
  },
  mapaContainer: {
    flex: 1,
    marginHorizontal: 0,
    marginBottom: 0,
    backgroundSize: 'contain',
  },
  mapaImage: {
    width: '100%',
    height: '100%',
  },
});

export default EntregadorHome;