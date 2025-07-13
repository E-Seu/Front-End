import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import CustomInput from './CustomInput';
import LocalizacaoIcon from '../assets/icons/localizacaoIcon';
import CompletedOrderModal from './CompletedOrderModal';
import PedidoService from '../services/PedidoService';
import LoginService from '../services/LoginService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CartModal = ({ 
  visible, 
  onClose, 
  restaurantName, 
  restaurantId, 
  cartItems, 
  produtos, 
  navigation,
  navigateToScreen // ✅ Adicionar navigateToScreen como prop
}) => {
  const [localEntrega, setLocalEntrega] = useState('');
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pedidoCriado, setPedidoCriado] = useState(null);

  console.log('📦 CartModal restaurantId:', restaurantId);
  console.log('📦 CartModal tipo do restaurantId:', typeof restaurantId);

  // Função para calcular o total
  const calculateTotal = () => {
    if (!cartItems || !produtos) return 0;
    
    let total = 0;
    Object.entries(cartItems).forEach(([productId, quantidade]) => {
      const produto = produtos.find(p => (p.id || p.produto_id).toString() === productId);
      if (produto) {
        total += produto.valor * quantidade;
      }
    });
    return total;
  };

  // Função para obter itens do carrinho com detalhes
  const getCartItemsWithDetails = () => {
    if (!cartItems || !produtos) return [];
    
    return Object.entries(cartItems).map(([productId, quantidade]) => {
      const produto = produtos.find(p => (p.id || p.produto_id).toString() === productId);
      if (produto) {
        return {
          id: productId,
          nome: produto.nome,
          valor: produto.valor,
          quantidade: quantidade,
          subtotal: produto.valor * quantidade
        };
      }
      return null;
    }).filter(item => item !== null);
  };

  // Função para verificar se há itens no carrinho
  const hasItemsInCart = () => {
    return cartItems && Object.keys(cartItems).length > 0;
  };

  // Função para criar observação com detalhes dos itens
  const criarObservacaoComItens = () => {
    const itensDetalhados = getCartItemsWithDetails();
    const observacao = itensDetalhados.map(item => 
      `${item.quantidade}x ${item.nome} - R$ ${item.subtotal.toFixed(2)}`
    ).join('; ');
    
    return observacao;
  };

  const handleFinalizarPedido = async () => {
    if (!hasItemsInCart()) {
      Alert.alert('Erro', 'Carrinho vazio! Adicione itens antes de finalizar.');
      return;
    }

    if (!localEntrega.trim()) {
      Alert.alert('Erro', 'Por favor, informe o local de entrega.');
      return;
    }

    if (!restaurantId) {
      Alert.alert('Erro', 'ID do restaurante não encontrado. Não é possível finalizar o pedido.');
      return;
    }

    try {
      setLoading(true);
      console.log('🛒 Iniciando criação do pedido...');

      // Obter dados do usuário logado
      const currentUser = await LoginService.getCurrentUser();
      if (!currentUser.success) {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        return;
      }

      const itensCarrinho = getCartItemsWithDetails();
      const total = calculateTotal();
      const clienteId = currentUser.user.id || currentUser.user.usuario_id;

      // Dados do pedido para enviar à API
      const pedidoData = {
        cliente_id: clienteId,
        restaurante_id: parseInt(restaurantId),
        entregador_id: null,
        status: "aguardando",
        preco_total: total,
        localizacao: localEntrega.trim(),
        data_hora: new Date().toISOString(),
        observacao: criarObservacaoComItens()
      };

      console.log('📦 Dados do pedido a ser criado:', pedidoData);
      console.log('👤 Cliente ID:', clienteId);
      console.log('🏪 Restaurante ID:', restaurantId);
      console.log('💰 Total:', total);
      console.log('📍 Local:', localEntrega);

      // Criar pedido via API
      const novoPedido = await PedidoService.criarPedido(pedidoData);

      if (novoPedido) {
        console.log('✅ Pedido criado com sucesso:', novoPedido);
        
        // Salvar dados do pedido criado
        setPedidoCriado(novoPedido);
        
        // Fechar modal do carrinho primeiro
        onClose();
        
        // Limpar campos
        setLocalEntrega('');
        
        // Pequeno delay para garantir que o pedido foi salvo
        setTimeout(() => {
          setShowCompletedModal(true);
        }, 100);
        
      } else {
        Alert.alert('Erro', 'Falha ao criar pedido. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao finalizar pedido:', error);
      Alert.alert('Erro', `Ocorreu um erro ao finalizar o pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

 const handleGoToOrders = () => {
    console.log('🔄 CartModal - Navegando para tela de pedidos...');
    console.log('🔄 Pedido criado:', pedidoCriado);
    
    setShowCompletedModal(false);
    
    // Navegar para a tela de pedidos
    // Usar navigateToScreen do AppLayout se disponível
    if (typeof navigateToScreen === 'function') {
      console.log('🔄 Usando navigateToScreen do AppLayout...');
      navigateToScreen('ClientePedidos', { 
        refresh: true,
        newOrderId: pedidoCriado?.pedido_id,
        timestamp: Date.now()
      });
    }
    // Fallback para React Navigation se disponível
    else if (navigation && navigation.navigate) {
      console.log('🔄 Usando React Navigation...');
      navigation.navigate('ClientePedidos', { 
        refresh: true,
        newOrderId: pedidoCriado?.pedido_id,
        timestamp: Date.now()
      });
    }
    else {
      console.warn('⚠️ Nem navigateToScreen nem navigation estão disponíveis');
    }
    
    // Limpar estado após navegação
    setTimeout(() => {
      setPedidoCriado(null);
    }, 500);
  };

  const handleCloseModal = () => {
    if (!loading) {
      onClose();
      setLocalEntrega('');
      // Não limpar pedidoCriado aqui para manter referência
    }
  };

  const handleCloseCompletedModal = () => {
    console.log('🔄 Fechando modal de pedido concluído');
    setShowCompletedModal(false);
    setPedidoCriado(null);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemNameContainer}>
        <Text style={styles.itemQuantity}>{item.quantidade}x</Text>
        <Text style={styles.itemName}>{item.nome}</Text>
      </View>
      <Text style={styles.itemPrice}>R$ {item.subtotal.toFixed(2)}</Text>
    </View>
  );

  const cartItemsWithDetails = getCartItemsWithDetails();
  const total = calculateTotal();
  const isCartEmpty = !hasItemsInCart();

  return (
    <>
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayTouch} 
            onPress={handleCloseModal}
            activeOpacity={1}
            disabled={loading}
          />
          
          {/* Modal Content */}
          <View style={styles.modalContainer}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              {/* Handle do modal */}
              <View style={styles.handle} />
              
              {/* Conteúdo scrollável */}
              <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={!loading}
              >
                {/* Header */}
                <Text style={styles.restaurantName}>{restaurantName}</Text>

                {/* Pergunta sobre local */}
                <Text style={styles.questionText}>Qual o local de entrega?</Text>
                
                {/* Input para local com ícone */}
                <View style={styles.inputWithIcon}>
                  <CustomInput
                    placeholder="Ex: PPGCC, Bloco A, Sala 101"
                    value={localEntrega}
                    onChangeText={setLocalEntrega}
                    style={styles.inputContainer}
                    editable={!loading}
                  />
                  <View style={styles.iconContainer}>
                    <LocalizacaoIcon width={20} height={20} color="#8B0BD5" />
                  </View>
                </View>
                
                {/* Lista de produtos */}
                <View style={styles.itemsContainer}>
                  {isCartEmpty ? (
                    <View style={styles.emptyCartContainer}>
                      <Text style={styles.emptyCartText}>Seu carrinho está vazio</Text>
                      <Text style={styles.emptyCartSubText}>
                        Adicione itens para finalizar o pedido
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={cartItemsWithDetails}
                      renderItem={renderCartItem}
                      keyExtractor={(item) => item.id}
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={false}
                      style={styles.itemsList}
                    />
                  )}
                </View>
                
                {/* Linha separadora */}
                <View style={styles.separator} />
                
                {/* Total */}
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalText}>R$ {total.toFixed(2)}</Text>
                </View>
                
                {/* Resumo do pedido */}
                {!isCartEmpty && (
                  <View style={styles.resumoContainer}>
                    <Text style={styles.resumoTitle}>Resumo do Pedido:</Text>
                    <Text style={styles.resumoText}>
                      {cartItemsWithDetails.length} {cartItemsWithDetails.length === 1 ? 'item' : 'itens'}
                    </Text>
                    <Text style={styles.resumoText}>
                      Restaurante: {restaurantName}
                    </Text>
                    <Text style={styles.resumoText}>
                      Local de entrega: {localEntrega || 'Não informado'}
                    </Text>
                  </View>
                )}
                
                {/* Espaçamento para o botão fixo */}
                <View style={styles.bottomSpacing} />
              </ScrollView>
              
              {/* Botão Finalizar Pedido - Fixo na parte inferior */}
              <View style={styles.fixedBottomContainer}>
                <TouchableOpacity 
                  style={[
                    styles.finalizarButton,
                    (isCartEmpty || loading) && styles.finalizarButtonDisabled
                  ]} 
                  onPress={handleFinalizarPedido}
                  activeOpacity={(isCartEmpty || loading) ? 1 : 0.8}
                  disabled={isCartEmpty || loading}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#4E0777" />
                      <Text style={styles.loadingText}>Finalizando...</Text>
                    </View>
                  ) : (
                    <Text style={[
                      styles.finalizarButtonText,
                      (isCartEmpty || loading) && styles.finalizarButtonTextDisabled
                    ]}>
                      Finalizar Pedido
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
      
      <CompletedOrderModal
        visible={showCompletedModal}
        onClose={handleCloseCompletedModal}
        onGoToOrders={handleGoToOrders}
        pedidoId={pedidoCriado?.pedido_id}
        restaurantName={restaurantName}
        total={total}
        navigateToScreen={navigateToScreen} // ✅ Passar navigateToScreen
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: screenWidth * 0.8,
    height: screenHeight * 0.8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    marginBottom: 40,
    borderRadius: 30,
  },
  
  scrollContainer: {
    flex: 1,
  },
  
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  
  restaurantName: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#222222',
    textAlign: 'left',
    marginBottom: 10,
  },
  
  debugInfo: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#999999',
    marginBottom: 10,
  },
  
  questionText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    marginBottom: 12,
  },
  
  inputWithIcon: {
    position: 'relative',
    marginBottom: 20,
  },
  
  inputContainer: {
    marginBottom: 0,
  },
  
  iconContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  
  itemsContainer: {
    marginBottom: 16,
  },
  
  itemsList: {
    flexGrow: 0,
  },
  
  emptyCartContainer: {
    padding: 20,
    alignItems: 'center',
  },
  
  emptyCartText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#888888',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  emptyCartSubText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#AAAAAA',
    textAlign: 'center',
  },
  
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  itemNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
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
  
  resumoContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  
  resumoTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    marginBottom: 8,
  },
  
  resumoText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666666',
    marginBottom: 4,
  },
  
  bottomSpacing: {
    height: 80,
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
  
  finalizarButton: {
    width: 170,
    height: 41,
    backgroundColor: '#D9C0E7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  
  finalizarButtonDisabled: {
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: '#888888',
  },
  
  finalizarButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: '#4E0777',
  },
  
  finalizarButtonTextDisabled: {
    color: '#888888',
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  loadingText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#4E0777',
  },
});

export default CartModal;