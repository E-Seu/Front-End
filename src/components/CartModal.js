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
  Platform
} from 'react-native';
import CustomInput from './CustomInput';
import LocalizacaoIcon from '../assets/icons/localizacaoIcon';
import CompletedOrderModal from './CompletedOrderModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CartModal = ({ visible, onClose, restaurantName, cartItems, produtos }) => {
  const [localEntrega, setLocalEntrega] = useState('');
  const [showCompletedModal, setShowCompletedModal] = useState(false);

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

  const handleFinalizarPedido = () => {
    if (!hasItemsInCart()) {
      return; // Não fazer nada se não houver itens
    }

    console.log('Finalizar pedido:', {
      restaurante: restaurantName,
      localEntrega: localEntrega,
      itens: getCartItemsWithDetails(),
      total: calculateTotal()
    });
    
    // Fechar o modal do carrinho e abrir o modal de pedido concluído
    onClose();
    setShowCompletedModal(true);
  };

  const handleGoToOrders = () => {
    setShowCompletedModal(false);
    // Aqui você pode navegar para a tela de pedidos
    console.log('Navegar para pedidos');
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
        onRequestClose={onClose}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.overlayTouch} 
            onPress={onClose}
            activeOpacity={1}
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
              >
                {/* Header */}
                <Text style={styles.restaurantName}>{restaurantName}</Text>
                
                {/* Pergunta sobre local */}
                <Text style={styles.questionText}>Qual o local de entrega?</Text>
                
                {/* Input para local com ícone */}
                <View style={styles.inputWithIcon}>
                  <CustomInput
                    placeholder="Local"
                    value={localEntrega}
                    onChangeText={setLocalEntrega}
                    style={styles.inputContainer}
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
                
                {/* Espaçamento para o botão fixo */}
                <View style={styles.bottomSpacing} />
              </ScrollView>
              
              {/* Botão Finalizar Pedido - Fixo na parte inferior */}
              <View style={styles.fixedBottomContainer}>
                <TouchableOpacity 
                  style={[
                    styles.finalizarButton,
                    isCartEmpty && styles.finalizarButtonDisabled
                  ]} 
                  onPress={handleFinalizarPedido}
                  activeOpacity={isCartEmpty ? 1 : 0.8}
                  disabled={isCartEmpty}
                >
                  <Text style={[
                    styles.finalizarButtonText,
                    isCartEmpty && styles.finalizarButtonTextDisabled
                  ]}>
                    Finalizar Pedido
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
      
      {/* Modal de pedido concluído */}
      <CompletedOrderModal
        visible={showCompletedModal}
        onClose={() => setShowCompletedModal(false)}
        onGoToOrders={handleGoToOrders}
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
    fontFamily: 'Nunito-Regular',
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
    marginBottom: 20,
  },
  
  totalText: {
    fontSize: 14,
    fontFamily: 'Nunito-ExtraBold',
    color: '#4E0777',
  },
  
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-ExtraBold',
    color: '#4E0777',
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
});

export default CartModal;