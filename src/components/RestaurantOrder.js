import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import RestaurantOrderModal from './RestaurantOrderModal';
import ClienteService from '../services/ClienteService';

const RestaurantOrder = ({
  horario = "hora",
  nomeCliente: initialNomeCliente = "Cliente Exemplo",
  primeiroItem = "item exemplo",
  status = "",
  precoTotal = 0,
  pedidoId,
  pedido = {},
  cliente = {},
  onVisualizarPress,
  onStatusUpdated // Callback para notificar quando o status for atualizado
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [nomeCliente, setNomeCliente] = useState(initialNomeCliente);
  const [clienteId, setClienteId] = useState(pedido.cliente_id || pedido.clienteId || '');

  // Buscar nome real do cliente assim que o componente for montado ou pedido mudar
  useEffect(() => {
    const fetchNomeCliente = async () => {
      let usuarioId = pedido.usuario_id || pedido.usuarioId;
      let idCliente = pedido.cliente_id || pedido.clienteId || '';
      setClienteId(idCliente);

      // Se não vier direto, tenta buscar pelo cliente_id
      if (!usuarioId && idCliente) {
        const clienteData = await ClienteService.getCliente(idCliente);
        usuarioId = clienteData?.usuario_id;
      }
      if (usuarioId) {
        const nome = await ClienteService.getNomeClientePorUsuarioId(usuarioId);
        if (nome) setNomeCliente(nome);
        else setNomeCliente(initialNomeCliente);
      } else {
        setNomeCliente(initialNomeCliente);
      }
    };

    fetchNomeCliente();
    // eslint-disable-next-line
  }, [pedido]);

  // Atualizar status local quando prop mudar
  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  // Atualizar key do modal quando os dados mudarem
  useEffect(() => {
    if (modalVisible) {
      setModalKey(prev => prev + 1);
    }
  }, [currentStatus, precoTotal, pedido, modalVisible]);

  const handleVisualizarPress = () => {
    setModalVisible(true);
    if (onVisualizarPress) {
      onVisualizarPress();
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleStatusUpdated = (pedidoId, novoStatus) => {
    setCurrentStatus(novoStatus);
    if (onStatusUpdated) {
      onStatusUpdated(pedidoId, novoStatus);
    }
  };

  // Função para obter as configurações de estilo baseadas no status
  const getStatusConfig = (status) => {
    switch (status) {
      case 'aguardando':
        return {
          label: 'Pendente',
          color: '#F03800',
          elipseColor: '#F03800'
        };
      case 'em_preparo':
        return {
          label: 'Em preparo',
          color: '#8B0BD5',
          elipseColor: '#8B0BD5'
        };
      case 'pronto':
        return {
          label: 'Pronto',
          color: '#8B0BD5',
          elipseColor: '#8B0BD5'
        };
      case 'a_caminho':
        return {
          label: 'Saiu para entrega',
          color: '#8B0BD5',
          elipseColor: '#8B0BD5'
        };
      case 'entregue':
        return {
          label: 'Entregue',
          color: '#1BB313',
          elipseColor: '#1BB313'
        };
      case 'cancelado':
        return {
          label: 'Cancelado',
          color: '#888888',
          elipseColor: '#888888'
        };
      default:
        return {
          label: status || '',
          color: '#888888',
          elipseColor: '#888888'
        };
    }
  };

  const statusConfig = getStatusConfig(currentStatus);

  // Exibe nome + #id do cliente
  const nomeComId = `${nomeCliente}  #${clienteId}`;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Lado esquerdo - Informações do pedido */}
        <View style={styles.infoContainer}>
          <View style={styles.horarioContainer}>
            <Text style={styles.pedidoFeitoText}>Pedido feito às </Text>
            <Text style={styles.horarioText}>{horario}</Text>
          </View>
          <Text style={styles.nomeCliente}>{nomeComId}</Text>
          <Text style={styles.primeiroItem} numberOfLines={1}>
            {primeiroItem}...
          </Text>
        </View>

        {/* Lado direito - Elipse, status e botão */}
        <View style={styles.rightContainer}>
          <View style={styles.statusElipseContainer}>
            {currentStatus ? (
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            ) : null}
            <View style={[styles.elipse, { backgroundColor: statusConfig.elipseColor }]} />
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
        onRequestClose={handleCloseModal}
      >
        <RestaurantOrderModal
          key={modalKey}
          onClose={handleCloseModal}
          pedidoId={pedidoId || pedido.id || pedido.pedido_id}
          nomeCliente={nomeCliente}
          localizacao={pedido.localizacao || pedido.endereco || pedido.local || 'Não informado'}
          precoTotal={precoTotal || pedido.preco_total || pedido.total || 0}
          status={currentStatus}
          itens={pedido.itens || pedido.items || []}
          onStatusUpdated={handleStatusUpdated}
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
    marginRight: 8,
  },

  nomeCliente: {
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

  statusElipseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  elipse: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default RestaurantOrder;