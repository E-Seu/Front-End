import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RelogioIcon from '../assets/icons/relogioIcon';

const CurrentOrder = ({ 
  horario = "hora",
  nomeRestaurante = "Restaurante Exemplo",
  primeiroItem = "item exemplo",
  onVisualizarPress
}) => {
  
  const handleVisualizarPress = () => {
    console.log('Visualizar pedido pressionado');
    if (onVisualizarPress) {
      onVisualizarPress();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Lado esquerdo - Informações do pedido */}
        <View style={styles.infoContainer}>
          <View style={styles.horarioContainer}>
            <Text style={styles.pedidoFeitoText}>Pedido feito às </Text>
            <Text style={styles.horarioText}>{horario}</Text>
          </View>
          
          <Text style={styles.nomeRestaurante}>{nomeRestaurante}</Text>
          
          <Text style={styles.primeiroItem} numberOfLines={1}>
            {primeiroItem}...
          </Text>
        </View>

        {/* Lado direito - Ícone e botão */}
        <View style={styles.rightContainer}>
          <RelogioIcon width={25} height={25} />
          
          <TouchableOpacity 
            style={styles.visualizarButton}
            onPress={handleVisualizarPress}
            activeOpacity={0.7}
          >
            <Text style={styles.visualizarText}>Visualizar Pedido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    minHeight: 80,
  },

  infoContainer: {
    flex: 1,
    paddingRight: 15,
    justifyContent: 'space-between',
  },

  horarioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pedidoFeitoText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
  },

  horarioText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#222222',
  },

  nomeRestaurante: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#222222',
  },

  primeiroItem: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    lineHeight: 18,
  },

  rightContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    minHeight: 80,
  },

  visualizarButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },

  visualizarText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
  },
});

export default CurrentOrder;