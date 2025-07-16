import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import EntregadorService from '../services/EntregadorService';
import RelogioIcon from '../assets/icons/relogioIcon';
import ViewedOrderModal from './ViewedOrderModal';

const DeliveredOrder = ({ entregadorId, pedidosEntreguesIds = [] }) => {
  const [pedidosDetalhados, setPedidosDetalhados] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetalhes = async () => {
      setLoading(true);
      const detalhes = await Promise.all(
        pedidosEntreguesIds.map(async (pedidoId) => {
          const detalhe = await EntregadorService.visualizarPedidoEntregue(entregadorId, pedidoId);
          return detalhe;
        })
      );
      setPedidosDetalhados(detalhes.filter(Boolean));
      setLoading(false);
    };
    if (entregadorId && pedidosEntreguesIds.length > 0) {
      fetchDetalhes();
    } else {
      setPedidosDetalhados([]);
      setLoading(false);
    }
  }, [entregadorId, pedidosEntreguesIds]);

  const handleVisualizar = (pedido) => {
    setSelectedPedido(pedido);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedPedido(null);
  };

  const renderPedido = ({ item }) => (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.infoContainer}>
          <View style={styles.horarioContainer}>
            <Text style={styles.pedidoFeitoText}>Entregue às </Text>
            <Text style={styles.horarioText}>{item.horario_entrega || item.horario || '---'}</Text>
          </View>
          <Text style={styles.nomeRestaurante}>{item.restaurante_nome || 'Restaurante'}</Text>
          <Text style={styles.primeiroItem} numberOfLines={1}>
            {item.pedido_produtos?.[0]?.produto?.nome || 'item'}...
          </Text>
        </View>
        <View style={styles.rightContainer}>
          <View style={styles.statusRelogioContainer}>
            <Text style={styles.statusText}>Entregue</Text>
            <RelogioIcon width={25} height={25} style={{ marginLeft: 4 }} />
          </View>
          <TouchableOpacity
            style={styles.visualizarButton}
            onPress={() => handleVisualizar(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.visualizarText}>Visualizar Pedido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ marginTop: 32 }}>
        <ActivityIndicator size="large" color="#8B0BD5" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={pedidosDetalhados}
        keyExtractor={(item) => String(item.pedido_id)}
        renderItem={renderPedido}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 24, color: '#888' }}>
            Nenhum pedido entregue encontrado.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        {selectedPedido && (
          <ViewedOrderModal
            onClose={handleCloseModal}
            pedidoId={selectedPedido.pedido_id}
            nomeRestaurante={selectedPedido.restaurante_nome}
            localizacao={selectedPedido.localizacao || selectedPedido.endereco || selectedPedido.local || 'Não informado'}
            precoTotal={selectedPedido.preco_total || 0}
            status={selectedPedido.status}
            nomeEntregador={selectedPedido.entregador_nome || ''}
            itens={selectedPedido.pedido_produtos || []}
          />
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F7F7',
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

export default DeliveredOrder;