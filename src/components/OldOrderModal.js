import React, { useState, useEffect } from 'react';
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
import PedidoService from '../services/PedidoService';
import LoginService from '../services/LoginService';
import RestaurantService from '../services/RestaurantService';
import ClienteService from '../services/ClienteService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const OldOrderModal = ({ 
  visible, 
  onClose, 
  pedidoOriginal,
  navigation,
  navigateToScreen
}) => {
  const [localEntrega, setLocalEntrega] = useState('');
  const [loading, setLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantData, setRestaurantData] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [saldoCliente, setSaldoCliente] = useState(0);


  // Carregar dados do pedido original quando o modal abrir
  useEffect(() => {
  if (visible && pedidoOriginal) {
    loadPedidoData();
    loadSaldoCliente();
  }
}, [visible, pedidoOriginal]);

  const loadPedidoData = async () => {
    try {
      console.log('🔄 Carregando dados do pedido original:', pedidoOriginal);
      
      // Buscar dados do restaurante
      const restaurante = await RestaurantService.getRestaurantById(pedidoOriginal.restaurante_id);
      if (restaurante) {
        setRestaurantName(restaurante.nome);
        setRestaurantData(restaurante);
      }
      
      // Buscar produtos do restaurante
      const produtosList = await RestaurantService.getProductsByRestaurant(pedidoOriginal.restaurante_id);
      setProdutos(produtosList || []);
      
      // Pré-preencher local de entrega do pedido original
      if (pedidoOriginal.localizacao) {
        setLocalEntrega(pedidoOriginal.localizacao);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados do pedido:', error);
      setRestaurantName(`Restaurante ${pedidoOriginal.restaurante_id}`);
    }
  };

  const loadSaldoCliente = async () => {
  try {
    const currentUser = await LoginService.getCurrentUser();
    if (currentUser.success) {
      const clienteId = currentUser.user.id || currentUser.user.usuario_id;
      const saldoResponse = await ClienteService.visualizarSaldo(clienteId);
      if (saldoResponse) {
        setSaldoCliente(saldoResponse.saldo);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao carregar saldo do cliente:', error);
    setSaldoCliente(0);
  }
};

  // Função para calcular o total do pedido original
  const calculateTotal = () => {
    if (!pedidoOriginal || !pedidoOriginal.preco_total) return 0;
    return typeof pedidoOriginal.preco_total === 'string' 
      ? parseFloat(pedidoOriginal.preco_total) 
      : pedidoOriginal.preco_total;
  };

  // Função para obter itens do pedido original com detalhes
  const getCartItemsWithDetails = () => {
    if (!pedidoOriginal || !pedidoOriginal.produtos || !Array.isArray(pedidoOriginal.produtos)) {
      return [];
    }
    
    return pedidoOriginal.produtos.map((produto, index) => {
      // Buscar informações completas do produto
      const produtoCompleto = produtos.find(p => 
        (p.id || p.produto_id) === produto.produto_id
      );
      
      return {
        id: produto.produto_id ? produto.produto_id.toString() : index.toString(),
        nome: produtoCompleto?.nome || `Produto ${produto.produto_id}`,
        valor: produto.preco_item || 0,
        quantidade: produto.quantidade || 1,
        subtotal: (produto.preco_item || 0) * (produto.quantidade || 1)
      };
    });
  };

  // Função para verificar se há itens no pedido
  const hasItemsInCart = () => {
    return pedidoOriginal && pedidoOriginal.produtos && pedidoOriginal.produtos.length > 0;
  };

  // Função para criar observação com detalhes dos itens
  const criarObservacaoComItens = () => {
    const itensDetalhados = getCartItemsWithDetails();
    const observacao = itensDetalhados.map(item => 
      `${item.quantidade}x ${item.nome} - R$ ${item.subtotal.toFixed(2)}`
    ).join('; ');
    
    return observacao;
  };

  // ✅ Função principal para fazer o pedido novamente
  const handlePecaNovamente = async () => {
    if (!hasItemsInCart()) {
      Alert.alert('Erro', 'Não há itens no pedido original.');
      return;
    }

    if (!localEntrega.trim()) {
      Alert.alert('Erro', 'Por favor, informe o local de entrega.');
      return;
    }

    if (!pedidoOriginal.restaurante_id) {
      Alert.alert('Erro', 'ID do restaurante não encontrado.');
      return;
    }

    const total = calculateTotal();
    if (total <= 0) {
      Alert.alert('Erro', 'Total do pedido deve ser maior que zero.');
      return;
    }

    if (saldoCliente < total) {
      Alert.alert(
        'Saldo Insuficiente',
        `Seu saldo atual é R$ ${saldoCliente.toFixed(2)} e o total do pedido é R$ ${total.toFixed(2)}. Recarregue sua carteira para continuar.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Iniciando pedido novamente...');

      // Obter dados do usuário logado
      const currentUser = await LoginService.getCurrentUser();
      if (!currentUser.success) {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        return;
      }

      const clienteId = currentUser.user.id || currentUser.user.usuario_id;

      // ✅ VERIFICAÇÃO 1: Verificar se o cliente já tem pedido ativo
      const { temPedidoAtivo, pedidoAtivo } = await PedidoService.clienteTemPedidoAtivo(clienteId);
      
      if (temPedidoAtivo) {
        const statusLabel = PedidoService.getStatusLabel(pedidoAtivo.status);
        Alert.alert(
          'Pedido Ativo Encontrado',
          `Você já possui um pedido ativo (${statusLabel}). Aguarde a entrega para fazer um novo pedido.`,
          [
            { text: 'Ver Pedido', onPress: () => {
              onClose();
              if (typeof navigateToScreen === 'function') {
                navigateToScreen('ClientePedidos');
              }
            }},
            { text: 'OK', style: 'cancel' }
          ]
        );
        return;
      }

      // ✅ VERIFICAÇÃO 2: Verificar se o restaurante está disponível
      let restauranteAtualizado = restaurantData;
      if (!restauranteAtualizado) {
        restauranteAtualizado = await RestaurantService.getRestaurantById(pedidoOriginal.restaurante_id);
      }

      if (!restauranteAtualizado || !restauranteAtualizado.disponivel) {
        Alert.alert(
          'Restaurante Indisponível',
          'Este restaurante está temporariamente indisponível. Não é possível fazer o pedido no momento.',
          [{ text: 'OK' }]
        );
        return;
      }

      // ✅ VERIFICAÇÃO 3: Verificar se os produtos ainda estão disponíveis
      const produtosAtualizados = await RestaurantService.getProductsByRestaurant(pedidoOriginal.restaurante_id);
      const produtosIndisponiveis = [];
      
      const produtosPedido = pedidoOriginal.produtos.map(produtoOriginal => {
        const produtoAtual = produtosAtualizados.find(p => 
          (p.id || p.produto_id) === produtoOriginal.produto_id
        );
        
        if (!produtoAtual || !produtoAtual.disponivel) {
          produtosIndisponiveis.push(produtoOriginal.produto_id);
        }
        
        return {
          produto_id: produtoOriginal.produto_id,
          quantidade: produtoOriginal.quantidade,
          preco_item: produtoAtual ? (produtoAtual.valor || produtoAtual.preco) : produtoOriginal.preco_item
        };
      }).filter(produto => {
        // Filtrar produtos indisponíveis
        return !produtosIndisponiveis.includes(produto.produto_id);
      });

      if (produtosIndisponiveis.length > 0) {
        Alert.alert(
          'Produtos Indisponíveis',
          'Alguns produtos do pedido original não estão mais disponíveis. O pedido será criado apenas com os produtos disponíveis.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Continuar', onPress: () => continuarComProdutosDisponiveis() }
          ]
        );
        return;
      }

      await criarNovoPedido(clienteId, produtosPedido, total);

    } catch (error) {
      console.error('❌ Erro ao fazer pedido novamente:', error);
      
      if (error.message.includes('pedido ativo')) {
        Alert.alert('Pedido Ativo', error.message, [
          { text: 'Ver Pedido', onPress: () => {
            onClose();
            if (typeof navigateToScreen === 'function') {
              navigateToScreen('ClientePedidos');
            }
          }},
          { text: 'OK', style: 'cancel' }
        ]);
      } else {
        Alert.alert('Erro', `Ocorreu um erro ao fazer o pedido: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para continuar com produtos disponíveis
  const continuarComProdutosDisponiveis = async () => {
    try {
      const currentUser = await LoginService.getCurrentUser();
      const clienteId = currentUser.user.id || currentUser.user.usuario_id;
      
      const produtosAtualizados = await RestaurantService.getProductsByRestaurant(pedidoOriginal.restaurante_id);
      const produtosPedido = pedidoOriginal.produtos.map(produtoOriginal => {
        const produtoAtual = produtosAtualizados.find(p => 
          (p.id || p.produto_id) === produtoOriginal.produto_id
        );
        
        if (produtoAtual && produtoAtual.disponivel) {
          return {
            produto_id: produtoOriginal.produto_id,
            quantidade: produtoOriginal.quantidade,
            preco_item: produtoAtual.valor || produtoAtual.preco
          };
        }
        return null;
      }).filter(produto => produto !== null);

      const novoTotal = produtosPedido.reduce((total, produto) => 
        total + (produto.preco_item * produto.quantidade), 0
      );

      await criarNovoPedido(clienteId, produtosPedido, novoTotal);
      
    } catch (error) {
      console.error('❌ Erro ao continuar com produtos disponíveis:', error);
      Alert.alert('Erro', 'Não foi possível criar o pedido com os produtos disponíveis.');
    }
  };

  // Função para criar o novo pedido
  const criarNovoPedido = async (clienteId, produtosPedido, total) => {
    const pedidoData = {
      cliente_id: clienteId,
      restaurante_id: parseInt(pedidoOriginal.restaurante_id),
      entregador_id: null,
      status: "aguardando",
      preco_total: total,
      localizacao: localEntrega.trim(),
      data_hora: new Date().toISOString(),
      observacao: criarObservacaoComItens(),
      produtos: produtosPedido
    };

    console.log('📦 Dados do novo pedido:', pedidoData);

    // Criar pedido via API
    const novoPedido = await PedidoService.criarPedido(pedidoData);

    if (novoPedido) {
      console.log('✅ Pedido criado com sucesso:', novoPedido);

      const novoSaldo = saldoCliente - total;
      await ClienteService.atualizarSaldo(clienteId, novoSaldo);
      setSaldoCliente(novoSaldo);
      
      // ✅ Fechar modal e mostrar sucesso
      onClose();
      
      // Limpar campos
      setLocalEntrega('');
      
      // ✅ Mostrar mensagem de sucesso - SEM NAVEGAÇÃO NO CALLBACK
      Alert.alert(
        'Pedido Criado!',
        `Pedido #${novoPedido.pedido_id} criado com sucesso!\nTotal: R$ ${total.toFixed(2)}\nRestaurante: ${restaurantName}`,
        [
          { text: 'OK', onPress: () => {
            console.log('✅ Pedido criado, modal fechado');
            // Não fazer navegação aqui, apenas confirmar
          }}
        ]
      );
      
      // ✅ Navegar automaticamente sem depender do callback do Alert
      setTimeout(() => {
        if (typeof navigateToScreen === 'function') {
          navigateToScreen('ClientePedidos', { 
            refresh: true,
            newOrderId: novoPedido.pedido_id,
            timestamp: Date.now()
          });
        } else if (navigation && navigation.navigate) {
          navigation.navigate('ClientePedidos', { 
            refresh: true,
            newOrderId: novoPedido.pedido_id,
            timestamp: Date.now()
          });
        }
      }, 100);
      
    } else {
      Alert.alert('Erro', 'Falha ao criar pedido. Tente novamente.');
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      onClose();
      setLocalEntrega('');
    }
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
  const saldoInsuficiente = saldoCliente < total;

  if (!pedidoOriginal) {
    return null;
  }

  return (
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
              <Text style={styles.subtitle}>Repetir pedido anterior</Text>

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
                    <Text style={styles.emptyCartText}>Pedido original sem itens</Text>
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

              {/* Saldo da carteira */}
              <View style={styles.saldoContainer}>
                <Text style={styles.saldoLabel}>Saldo atual da Carteira</Text>
                <Text style={[styles.saldoText, saldoCliente < total && styles.saldoInsuficiente]}>
                  R$ {saldoCliente.toFixed(2)}
                </Text>
              </View>

              {/* Aviso de saldo insuficiente */}
              {saldoCliente < total && !isCartEmpty && (
                <View style={styles.avisoSaldoContainer}>
                  <Text style={styles.avisoSaldoText}>
                    Saldo insuficiente! Recarregue sua carteira para continuar.
                  </Text>
                </View>
              )}
              
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
            
            {/* Botão Peça Novamente - Fixo na parte inferior */}
            <View style={styles.fixedBottomContainer}>
              <TouchableOpacity 
                style={[
                  styles.pecaNovamenteButton,
                  (isCartEmpty || loading || saldoInsuficiente) && styles.pecaNovamenteButtonDisabled // ✅ Adicionar saldoInsuficiente
                ]} 
                onPress={handlePecaNovamente}
                activeOpacity={(isCartEmpty || loading || saldoInsuficiente) ? 1 : 0.8} // ✅ Adicionar saldoInsuficiente
                disabled={isCartEmpty || loading || saldoInsuficiente} // ✅ Adicionar saldoInsuficiente
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#4E0777" />
                    <Text style={styles.loadingText}>Processando...</Text>
                  </View>
                ) : (
                  <Text style={[
                    styles.pecaNovamenteButtonText,
                    (isCartEmpty || loading || saldoInsuficiente) && styles.pecaNovamenteButtonTextDisabled // ✅ Adicionar saldoInsuficiente
                  ]}>
                    Peça Novamente
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
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
    marginBottom: 5,
  },
  
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666666',
    textAlign: 'left',
    marginBottom: 20,
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
  
  pecaNovamenteButton: {
    width: 170,
    height: 41,
    backgroundColor: '#D9C0E7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  
  pecaNovamenteButtonDisabled: {
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: '#888888',
  },
  
  pecaNovamenteButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: '#4E0777',
  },
  
  pecaNovamenteButtonTextDisabled: {
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

  saldoContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
  },

  saldoLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#888888',
  },

  saldoText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#888888',
  },

  saldoInsuficiente: {
    color: '#FF4444',
  },

  avisoSaldoContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFB3B3',
  },

  avisoSaldoText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#CC0000',
    textAlign: 'center',
  },
});

export default OldOrderModal;