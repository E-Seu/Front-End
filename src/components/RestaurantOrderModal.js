import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import PedidoService from '../services/PedidoService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const RestaurantOrderModal = ({
  onClose,
  pedidoId,
  nomeCliente: initialNomeCliente = 'Cliente',
  localizacao: initialLocalizacao = 'Não informado',
  precoTotal: initialPrecoTotal = 0,
  status: initialStatus = '',
  itens: initialItens = [],
  onStatusUpdated, // Callback para notificar quando o status for atualizado
}) => {
  const [pedidoData, setPedidoData] = useState({
    nomeCliente: initialNomeCliente,
    localizacao: initialLocalizacao,
    precoTotal: initialPrecoTotal,
    status: initialStatus,
    itens: initialItens,
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Carregar dados do pedido da API
  useEffect(() => {
    if (pedidoId) {
      loadPedidoData();
    }
  }, [pedidoId]);

  // Atualizar dados periodicamente enquanto o modal estiver aberto
  useEffect(() => {
    if (!pedidoId) return;

    const interval = setInterval(() => {
      loadPedidoData();
    }, 10000); // Atualizar a cada 10 segundos

    return () => clearInterval(interval);
  }, [pedidoId]);

  const loadPedidoData = async () => {
    if (!pedidoId) return;
    
    try {
      setLoading(true);
      const pedido = await PedidoService.buscarPedido(pedidoId);
      let itensPedido = pedido.produtos || pedido.pedido_produtos || pedido.itens || pedido.items || initialItens;
      if (pedido) {
        setPedidoData({
          nomeCliente: `Cliente ${pedido.cliente_id}`, // Por enquanto mantém como Cliente {id}
          localizacao: pedido.localizacao || pedido.endereco || pedido.local || initialLocalizacao,
          precoTotal: pedido.preco_total || pedido.total || initialPrecoTotal,
          status: pedido.status || initialStatus,
          itens: itensPedido,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do pedido:', error);
    } finally {
      setLoading(false);
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

  const handleAceitarPedido = async () => {
    if (!pedidoId) return;
    
    try {
      setActionLoading(true);
      console.log(`Aceitando pedido ${pedidoId}...`);
      
      // Atualizar status para "em_preparo"
      await PedidoService.atualizarStatusPedido(pedidoId, 'em_preparo');
      
      // Atualizar dados localmente
      setPedidoData(prev => ({
        ...prev,
        status: 'em_preparo'
      }));
      
      // Notificar componente pai
      if (onStatusUpdated) {
        onStatusUpdated(pedidoId, 'em_preparo');
      }
      
      Alert.alert('Sucesso', 'Pedido aceito e está em preparo!');
      
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
      
      let mensagemErro = 'Não foi possível aceitar o pedido. Tente novamente.';
      
      if (error.response) {
        if (error.response.status === 422) {
          mensagemErro = 'Dados inválidos para atualizar o pedido.';
        } else if (error.response.status === 404) {
          mensagemErro = 'Pedido não encontrado.';
        } else if (error.response.status >= 500) {
          mensagemErro = 'Erro interno do servidor. Tente novamente mais tarde.';
        }
      } else if (error.message.includes('timeout')) {
        mensagemErro = 'Timeout na conexão. Verifique sua internet.';
      } else if (error.message.includes('Network Error')) {
        mensagemErro = 'Erro de rede. Verifique sua conexão.';
      }
      
      Alert.alert('Erro', mensagemErro);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejeitarPedido = () => {
    // Por enquanto não faz nada, conforme solicitado
    Alert.alert('Informação', 'Função de rejeitar pedido será implementada em breve.');
  };

  const handleSaiuParaEntrega = async () => {
    if (!pedidoId) return;
    
    try {
      setActionLoading(true);
      console.log(`Atualizando pedido ${pedidoId} para "a_caminho"...`);
      
      // Atualizar status para "a_caminho"
      await PedidoService.atualizarStatusPedido(pedidoId, 'a_caminho');
      
      // Atualizar dados localmente
      setPedidoData(prev => ({
        ...prev,
        status: 'a_caminho'
      }));
      
      // Notificar componente pai
      if (onStatusUpdated) {
        onStatusUpdated(pedidoId, 'a_caminho');
      }
      
      Alert.alert('Sucesso', 'Status atualizado para "Saiu para entrega"!');
      
    } catch (error) {
      console.error('Erro ao atualizar status para entrega:', error);
      
      let mensagemErro = 'Não foi possível atualizar o status. Tente novamente.';
      
      if (error.response) {
        if (error.response.status === 422) {
          mensagemErro = 'Dados inválidos para atualizar o pedido.';
        } else if (error.response.status === 404) {
          mensagemErro = 'Pedido não encontrado.';
        } else if (error.response.status >= 500) {
          mensagemErro = 'Erro interno do servidor. Tente novamente mais tarde.';
        }
      } else if (error.message.includes('timeout')) {
        mensagemErro = 'Timeout na conexão. Verifique sua internet.';
      } else if (error.message.includes('Network Error')) {
        mensagemErro = 'Erro de rede. Verifique sua conexão.';
      }
      
      Alert.alert('Erro', mensagemErro);
    } finally {
      setActionLoading(false);
    }
  };

const renderItens = () => {
  // Busca itens do pedido em todas as possíveis chaves, igual ao ViewedOrderModal
  let itensPedido =
    pedidoData.produtos ||
    pedidoData.pedido_produtos ||
    pedidoData.itens ||
    pedidoData.items ||
    [];

  if (!Array.isArray(itensPedido) || itensPedido.length === 0) {
    return (
      <Text style={styles.emptyCartText}>Nenhum item no pedido.</Text>
    );
  }

  return itensPedido.map((item, idx) => {
    // Nome do produto: tenta pegar do objeto aninhado ou direto
    const nomeProduto =
      item.nome ||
      item.nome_produto ||
      (item.produto && (item.produto.nome || item.produto.nome_produto)) ||
      (typeof item.produto === 'string' ? item.produto : '') ||
      '';

    // Preço do produto: tenta pegar do objeto aninhado ou direto
    const preco =
      item.preco_item !== undefined
        ? item.preco_item
        : item.preco ||
          item.valor ||
          item.preco_unitario ||
          (item.produto && (item.produto.preco || item.produto.valor)) ||
          0;

    // Quantidade
    const quantidade = item.quantidade || item.qtd || item.quant || 1;

    return (
      <View key={idx} style={styles.cartItem}>
        <View style={styles.itemNameContainer}>
          <Text style={styles.itemQuantity}>{quantidade}x</Text>
          <Text style={styles.itemName}>{nomeProduto}</Text>
        </View>
        <Text style={styles.itemPrice}>
          R$ {Number(preco).toFixed(2)}
        </Text>
      </View>
    );
  });
};

  const renderBottomActions = () => {
    const { status } = pedidoData;
    
    if (status === 'aguardando') {
      return (
        <View style={styles.fixedBottomContainer}>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejeitarButton]}
              onPress={handleRejeitarPedido}
              activeOpacity={0.8}
              disabled={actionLoading}
            >
              <Text style={styles.rejeitarButtonText}>Rejeitar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.aceitarButton]}
              onPress={handleAceitarPedido}
              activeOpacity={0.8}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.aceitarButtonText}>Aceitar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    if (status === 'em_preparo') {
      return (
        <View style={styles.fixedBottomContainer}>
          <Text style={styles.updateStatusLabel}>Atualizar Status para:</Text>
          <TouchableOpacity
            style={[styles.actionButton, styles.saiuParaEntregaButton]}
            onPress={handleSaiuParaEntrega}
            activeOpacity={0.8}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saiuParaEntregaButtonText}>Saiu para entrega</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }
    
    // Para status 'a_caminho' e 'entregue', não há ações adicionais
    return null;
  };

  const statusConfig = getStatusConfig(pedidoData.status);

  return (
    <View style={styles.overlay}>
      {/* TouchableOpacity para fechar ao clicar fora */}
      <TouchableOpacity
        style={styles.overlayTouchable}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.handle} />
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

            {/* Loading indicator */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#8B0BD5" />
              </View>
            )}

            {/* Status com elipse */}
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
              <View style={[styles.elipse, { backgroundColor: statusConfig.elipseColor }]} />
            </View>

            {/* Nome do cliente */}
            <Text style={styles.clienteName}>{pedidoData.nomeCliente}</Text>

            {/* Local de entrega */}
            <Text style={styles.localEntrega}>{pedidoData.localizacao}</Text>

            {/* Itens do pedido */}
            <View style={styles.itemsContainer}>
              {renderItens()}
            </View>

            {/* Separador */}
            <View style={styles.separator} />

            {/* Total */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalText}>R$ {Number(pedidoData.precoTotal).toFixed(2)}</Text>
            </View>

            {/* Espaçamento para o botão fixo */}
            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* Botões de ação baseados no status */}
          {renderBottomActions()}
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: screenWidth * 0.85,
    height: screenHeight * 0.8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
    zIndex: 2,
  },
  keyboardView: {
    flex: 1,
  },
  handle: {
    width: 80,
    height: 6,
    backgroundColor: '#D9C0E7',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 30,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
    paddingBottom: 24,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#8B0BD5',
    textAlign: 'left',
    marginTop: 15,
    marginBottom: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 5,
    right: 24,
    zIndex: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    marginRight: 8,
  },
  elipse: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  clienteName: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#222222',
    textAlign: 'left',
    marginBottom: 5,
  },
  localEntrega: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#888888',
    textAlign: 'left',
    marginBottom: 20,
  },
  itemsContainer: {
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  itemNameContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  itemQuantity: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    marginRight: 8,
    minWidth: 30,
  },
  itemName: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
  },
  separator: {
    height: 1,
    backgroundColor: '#D9C0E7',
    marginVertical: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: '#4E0777',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: '#4E0777',
  },
  emptyCartText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#888888',
    textAlign: 'center',
    marginBottom: 8,
  },
  bottomSpacing: {
    height: 100, // Espaço maior para acomodar os botões
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },

   buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  actionButton: {
    height: 41, 
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: 132, 
  },
  rejeitarButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B0BD5',
  },
  rejeitarButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#8B0BD5', 
  },
  aceitarButton: {
    backgroundColor: '#D9C0E7',
    borderWidth: 0,
  },
  aceitarButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
  },
  updateStatusLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#888888',
    marginBottom: 12,
    textAlign: 'center',
  },

  saiuParaEntregaButton: {
    width: 200,
    height: 41,
    backgroundColor: '#D9C0E7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  
  saiuParaEntregaButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: '#4E0777',
  },
});

export default RestaurantOrderModal;