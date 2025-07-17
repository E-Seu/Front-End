import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import OldOrderModal from './OldOrderModal';

const OldOrder = ({ 
  dia = "dia exemplo",
  horario = "horario exemplo",
  nomeRestaurante = "Restaurante Exemplo",
  primeiroItem = "item exemplo",
  pedidoOriginal,
  navigation,
  navigateToScreen,
  onPecaNovamantePress
}) => {
  const [showModal, setShowModal] = useState(false);
  
  const handlePecaNovamantePress = () => {
    console.log('🔄 Peça Novamente pressionado para pedido:', pedidoOriginal?.pedido_id);
    
    if (pedidoOriginal) {
      // Abrir modal personalizado
      setShowModal(true);
    } else {
      // Fallback para função original
      if (onPecaNovamantePress) {
        onPecaNovamantePress();
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Lado esquerdo - Informações do pedido */}
          <View style={styles.infoContainer}>
            <View style={styles.horarioContainer}>
              <Text style={styles.pedidoFeitoText}>Pedido feito em {dia} às {horario}</Text>
            </View>
            
            <Text style={styles.nomeRestaurante}>{nomeRestaurante}</Text>
            
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Pedido concluído</Text>
              <Image 
                source={require('../assets/pedidoConcluído.png')}
                style={styles.statusIcon}
              />
            </View>
            
            <Text style={styles.primeiroItem} numberOfLines={1}>
              {primeiroItem}...
            </Text>
          </View>

          {/* Lado direito - Apenas o botão */}
          <View style={styles.rightContainer}>
            <TouchableOpacity 
              style={styles.pecaNovamanteButton}
              onPress={handlePecaNovamantePress}
              activeOpacity={0.7}
            >
              <Text style={styles.pecaNovamanteText}>Peça Novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal para Peça Novamente */}
      <OldOrderModal
        visible={showModal}
        onClose={handleCloseModal}
        pedidoOriginal={pedidoOriginal}
        navigation={navigation}
        navigateToScreen={navigateToScreen}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#888888',
    padding: 16,
    marginTop: 10,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: '#565656',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 110,
  },

  infoContainer: {
    flex: 1,
    paddingRight: 15,
    justifyContent: 'space-between',
  },

  horarioContainer: {
    marginBottom: 8,
  },

  pedidoFeitoText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#888888',
  },

  nomeRestaurante: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#222222',
    marginBottom: 8,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  statusText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    marginRight: 8,
  },

  statusIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },

  primeiroItem: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    lineHeight: 18,
  },

  rightContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    minHeight: 110,
  },

  pecaNovamanteButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },

  pecaNovamanteText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#4E0777',
  },
});

export default OldOrder;