import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import RelogioIcon from '../assets/icons/relogioIcon';
import PedidoVisualizado from './PedidoVisualizado';

const CurrentOrder = ({ 
  horario = "hora",
  nomeRestaurante = "Restaurante Exemplo",
  primeiroItem = "item exemplo",
  status = "",
  pedido = {},
  restaurante = {},
  entregador = {},
  onVisualizarPress
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleVisualizarPress = () => {
    setModalVisible(true);
    if (onVisualizarPress) {
      onVisualizarPress();
    }
  };

  // Função para exibir o status de forma amigável (opcional)
  const getStatusLabel = (status) => {
    switch (status) {
      case 'aguardando': return 'Aguardando';
      case 'em_preparo': return 'Em preparo';
      case 'pronto': return 'Pronto';
      case 'a_caminho': return 'A caminho';
      case 'entregue': return 'Entregue';
      case 'cancelado': return 'Cancelado';
      default: return status || '';
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

        {/* Lado direito - Ícone, status e botão */}
        <View style={styles.rightContainer}>
          <View style={styles.statusRelogioContainer}>
            {status ? (
              <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
            ) : null}
            <RelogioIcon width={25} height={25} style={{ marginLeft: 4 }} />
          </View>
          <TouchableOpacity 
            style={styles.visualizarButton}
            onPress={handleVisualizarPress}
            activeOpacity={0.7}
          >
            <Text style={styles.visualizarText}>Visualizar Pedido</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Modal de visualização do pedido */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <PedidoVisualizado
          onClose={() => setModalVisible(false)}
          pedido={pedido}
          restaurante={restaurante}
          entregador={entregador}
        />
      </Modal>
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

  statusText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    marginRight: 8,
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

  statusRelogioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default CurrentOrder;