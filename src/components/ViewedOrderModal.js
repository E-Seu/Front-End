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
  Image,
  ActivityIndicator,
} from 'react-native';
import PedidoService from '../services/PedidoService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ViewedOrderModal = ({
  onClose,
  pedidoId,
  nomeRestaurante: initialNomeRestaurante = 'Restaurante',
  localizacao: initialLocalizacao = 'Não informado',
  precoTotal: initialPrecoTotal = 0,
  status: initialStatus = '',
  nomeEntregador: initialNomeEntregador = '',
  itens: initialItens = [],
  onStatusChange // <-- NOVO: callback do pai
}) => {
  const [pedidoData, setPedidoData] = useState({
    nomeRestaurante: initialNomeRestaurante,
    localizacao: initialLocalizacao,
    precoTotal: initialPrecoTotal,
    status: initialStatus,
    nomeEntregador: initialNomeEntregador,
    itens: initialItens,
  });
  const [loading, setLoading] = useState(false);

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
    }, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, [pedidoId]);

  const loadPedidoData = async () => {
    if (!pedidoId) return;
    
    try {
      setLoading(true);
      const pedido = await PedidoService.buscarPedido(pedidoId);
      
      if (pedido) {
        // Pega os itens do pedido, seja do campo produtos, pedido_produtos ou itens
        let itensPedido = pedido.produtos || pedido.pedido_produtos || pedido.itens || pedido.items || initialItens;
        setPedidoData({
          nomeRestaurante: pedido.nomeRestaurante || initialNomeRestaurante,
          localizacao: pedido.localizacao || pedido.endereco || pedido.local || initialLocalizacao,
          precoTotal: pedido.preco_total || pedido.total || initialPrecoTotal,
          status: pedido.status || initialStatus,
          nomeEntregador: pedido.entregador_nome || pedido.nomeEntregador || initialNomeEntregador,
          itens: itensPedido,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para obter a imagem baseada no status
  const getStatusImage = (status) => {
    switch (status) {
      case 'aguardando':
        return require('../assets/images/statusImages/Aguardando-Restaurante.png');
      case 'em_preparo':
        return require('../assets/images/statusImages/Em-Preparo.png');
      case 'pronto':
        return require('../assets/images/statusImages/Saiu-Para-Entrega.png');
      case 'a_caminho':
        return require('../assets/images/statusImages/Saiu-Para-Entrega.png');
      case 'entregue':
        return require('../assets/images/statusImages/Entregue.png');
      default:
        return require('../assets/images/statusImages/Aguardando-Restaurante.png');
    }
  };

  const renderItens = () => {
    if (!Array.isArray(pedidoData.itens) || pedidoData.itens.length === 0) {
      return (
        <Text style={styles.emptyCartText}>Nenhum item no pedido.</Text>
      );
    }
    return pedidoData.itens.map((item, idx) => {
      // Se vier do pedido_produtos, o produto pode estar aninhado
      const nomeProduto = item.nome || item.nome_produto || (item.produto && (item.produto.nome || item.produto.nome_produto)) || item.produto || '';
      const preco = item.preco_item !== undefined ? item.preco_item : (item.preco || item.valor || item.preco_unitario || (item.produto && (item.produto.preco || item.produto.valor)) || 0);
      return (
        <View key={idx} style={styles.cartItem}>
          <View style={styles.itemNameContainer}>
            <Text style={styles.itemQuantity}>{item.quantidade || item.qtd || item.quant || 1}x</Text>
            <Text style={styles.itemName}>{nomeProduto}</Text>
          </View>
          <Text style={styles.itemPrice}>
            R$ {Number(preco).toFixed(2)}
          </Text>
        </View>
      );
    });
  };

  const handleCancelarPedido = async () => {
    if (!pedidoId) return;
    try {
      await PedidoService.cancelarPedido(pedidoId);
      loadPedidoData();
      if (onStatusChange) onStatusChange(); // <-- chama callback para atualizar lista
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
    }
  };

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
            {/* Título */}
            <Text style={styles.title}>Acompanhe o seu pedido!</Text>

            {/* Loading indicator */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#8B0BD5" />
              </View>
            )}

            {/* Imagem do status */}
            <View style={styles.statusImageContainer}>
              <Image 
                source={getStatusImage(pedidoData.status)} 
                style={styles.statusImage}
                resizeMode="contain"
              />
            </View>

            {/* Texto do entregador (apenas se status for "pronto") */}
            {pedidoData.status === 'pronto' && pedidoData.nomeEntregador && (
              <View style={styles.entregadorContainer}>
                <Text style={styles.entregadorText}>
                  <Text style={styles.entregadorNome}>{pedidoData.nomeEntregador}</Text>
                  <Text style={styles.entregadorTexto}> está a caminho</Text>
                </Text>
              </View>
            )}

            {/* Nome do restaurante */}
            <Text style={styles.restaurantName}>{pedidoData.nomeRestaurante}</Text>

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

          {/* Botão Cancelar Pedido - Fixo na parte inferior */}
          {pedidoData.status !== 'cancelado' && pedidoData.status !== 'entregue' && (
            <View style={styles.fixedBottomContainer}>
              <TouchableOpacity
                style={styles.cancelarButton}
                onPress={handleCancelarPedido}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelarButtonText}>Cancelar Pedido</Text>
              </TouchableOpacity>
            </View>
          )}
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
    marginBottom: -40,
  },
  loadingContainer: {
    position: 'absolute',
    top: 5,
    right: 24,
    zIndex: 10,
  },
  statusImageContainer: {
    alignItems: 'center',
    marginBottom: -20,
  },
  statusImage: {
    width: 250,
    height: 250,
    marginBottom: -30,
  },
  entregadorContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  entregadorText: {
    fontSize: 14,
    textAlign: 'left',
  },
  entregadorNome: {
    fontFamily: 'Nunito-Bold',
    color: '#888888',
  },
  entregadorTexto: {
    fontFamily: 'Nunito-Regular',
    color: '#888888',
  },
  restaurantName: {
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
    height: 60,
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
  cancelarButton: {
    alignSelf: 'flex-start',
  },
  cancelarButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#CCB9D8',
  },
});

export default ViewedOrderModal;