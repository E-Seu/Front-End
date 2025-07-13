import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import ConcluidoIcon from '../assets/icons/concluidoIcon';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CompletedOrderModal = ({ 
  visible, 
  onClose, 
  onGoToOrders, 
  pedidoId, 
  restaurantName, 
  total,
  navigateToScreen // ✅ Usar navigateToScreen em vez de navigation
}) => {
  
  const handleGoToOrders = () => {
    console.log('🔄 CompletedOrderModal - Botão "Ver Meus Pedidos" clicado');
    console.log('🔄 onGoToOrders existe?', typeof onGoToOrders === 'function');
    console.log('🔄 navigateToScreen existe?', typeof navigateToScreen === 'function');
    
    // Fechar o modal primeiro
    if (typeof onClose === 'function') {
      onClose();
    }
    
    // Tentar usar a função onGoToOrders primeiro (se fornecida)
    if (typeof onGoToOrders === 'function') {
      console.log('🔄 Chamando onGoToOrders...');
      onGoToOrders();
    } 
    // Fallback: usar navigateToScreen do AppLayout
    else if (typeof navigateToScreen === 'function') {
      console.log('🔄 Usando navigateToScreen do AppLayout...');
      navigateToScreen('ClientePedidos');
    }
    // Último recurso: log de erro
    else {
      console.error('❌ Nem onGoToOrders nem navigateToScreen estão disponíveis');
      console.error('❌ Props recebidas:', { 
        onGoToOrders: typeof onGoToOrders,
        navigateToScreen: typeof navigateToScreen,
        pedidoId
      });
    }
  };

  const handleClose = () => {
    console.log('🔄 CompletedOrderModal - Fechando modal');
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      {/* Overlay */}
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouch} 
          onPress={handleClose}
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
            
            {/* Conteúdo centralizado */}
            <View style={styles.contentContainer}>
              {/* Ícone de concluído */}
              <ConcluidoIcon width={120} height={120} color="#FF7F23" />
              
              {/* Texto de sucesso */}
              <Text style={styles.successText}>
                Pedido concluído com sucesso!
              </Text>
              
              {/* Informações do pedido */}
              {pedidoId && (
                <View style={styles.orderInfoContainer}>
                  <Text style={styles.orderIdText}>
                    Pedido #{pedidoId}
                  </Text>
                  {restaurantName && (
                    <Text style={styles.restaurantText}>
                      {restaurantName}
                    </Text>
                  )}
                  {total && (
                    <Text style={styles.totalText}>
                      Total: R$ {total.toFixed(2)}
                    </Text>
                  )}
                </View>
              )}
            </View>
            
            {/* Botão fixo na parte inferior */}
            <View style={styles.fixedBottomContainer}>
              <TouchableOpacity 
                style={styles.goToOrdersButton} 
                onPress={handleGoToOrders}
                activeOpacity={0.8}
              >
                <Text style={styles.goToOrdersButtonText}>Ver Meus Pedidos</Text>
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
    height: screenHeight * 0.7,
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
  
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  
  successText: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    textAlign: 'center',
    marginTop: 30,
    lineHeight: 28,
  },
  
  orderInfoContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8F6FB',
    borderRadius: 12,
    minWidth: 200,
  },
  
  orderIdText: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: '#4E0777',
    marginBottom: 8,
  },
  
  restaurantText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#666666',
    marginBottom: 4,
    textAlign: 'center',
  },
  
  totalText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#8B0BD5',
  },
  
  fixedBottomContainer: {
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
  
  goToOrdersButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#8B0BD5',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  goToOrdersButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: '#FFFFFF',
  },
});

export default CompletedOrderModal;