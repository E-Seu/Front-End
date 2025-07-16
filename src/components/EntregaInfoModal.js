import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import EntregadorService from '../services/EntregadorService';

const EntregaInfoModal = ({
  pedido,
  restauranteNome,
  clienteNome,
  onConcluirEntrega,
}) => {
  if (!pedido) return null;

  const handleConcluirEntrega = async () => {
    const entregadorId = pedido.entregador_id || 1; // ajuste conforme sua lógica
    await EntregadorService.entregarPedido(entregadorId, pedido.pedido_id);
    if (onConcluirEntrega) onConcluirEntrega();
  };

  return (
    <View style={styles.infoModalBox}>
      <Text style={styles.infoModalTitle}>Mais Informações:</Text>
      <View style={styles.statusRow}>
        <View style={styles.statusDotActive} />
        <View style={styles.statusLine} />
        <View style={styles.statusDotActive} />
        <View style={styles.statusLine} />
        <View style={styles.statusDotInactive} />
      </View>
      <Text style={styles.modalSubtitle}>Pronto pra retirada</Text>
      <Text style={styles.modalInfoRest}>
        {restauranteNome || pedido.restaurante_nome || 'Nome do Restaurante'}
      </Text>
      <Text style={styles.modalInfo}>
        {pedido.localizacao || 'Localização não informada'}
      </Text>
      <Text style={styles.modalInfo}>
        Para {pedido.destino || 'Destino não informado'}
      </Text>
      <Text style={styles.modalInfo}>
        Entregar para <Text style={styles.modalDest}>
          {clienteNome || pedido.cliente_nome || `Cliente #${pedido.cliente_id}`}
        </Text>
      </Text>
      <View style={styles.divisor} />
      <Text style={styles.modalInfoBold}>Itens do pedido:</Text>
      {pedido.pedido_produtos && pedido.pedido_produtos.length > 0 ? (
        pedido.pedido_produtos.map((item, idx) => (
          <Text style={styles.modalInfoItem} key={idx}>
            {item.quantidade}x {item.produto?.nome} - R$ {parseFloat(item.preco_item).toFixed(2)}
          </Text>
        ))
      ) : (
        <Text style={styles.modalInfoItem}>Nenhum produto listado</Text>
      )}
      <View style={styles.divisor} />
      <View style={styles.ganhoRow}>
        <Text style={styles.modalInfoBold}>Ganho da entrega</Text>
        <Text style={styles.modalInfoBold}>R$ {parseFloat(pedido.preco_total).toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.concluirBtn}
        onPress={handleConcluirEntrega}
      >
        <Text style={styles.concluirText}>Concluir entrega</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  infoModalBox: {
    width: '88%',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    marginBottom: 80,
  },
  infoModalTitle: {
    fontSize: 15,
    color: '#4E0777',
    fontFamily: 'Nunito-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  statusDotActive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8B0BD5',
  },
  statusDotInactive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  statusLine: {
    width: 32,
    height: 4,
    backgroundColor: '#8B0BD5',
    borderRadius: 2,
    marginHorizontal: 2,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#FF9900',
    fontFamily: 'Nunito-Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInfoRest: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'Nunito-Bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  modalInfo: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'Nunito-Regular',
    marginBottom: 2,
    textAlign: 'center',
  },
  modalInfoBold: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'Nunito-Bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  modalInfoItem: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Nunito-Regular',
    marginBottom: 2,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  modalDest: {
    color: '#4E0777',
    fontFamily: 'Nunito-Bold',
  },
  divisor: {
    width: '100%',
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 8,
  },
  ganhoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  concluirBtn: {
    marginTop: 18,
    backgroundColor: '#BCA7E7',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  concluirText: {
    color: '#4E0777',
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
});

export default EntregaInfoModal;