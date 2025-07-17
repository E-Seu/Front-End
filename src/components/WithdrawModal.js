import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Alert
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const WithdrawModal = ({ visible, onClose, onConfirm, currentBalance = 0 }) => {
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    if (currentBalance <= 0) {
      Alert.alert('Aviso', 'Você não possui saldo disponível para retirada.');
      return;
    }

    Alert.alert(
      'Confirmar Retirada',
      `Tem certeza que deseja retirar R$ ${formatarSaldo(currentBalance)}?\n\nApós confirmar, seu saldo será zerado.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setLoading(true);
              await onConfirm();
              onClose();
            } catch (error) {
              console.error('Erro ao retirar dinheiro:', error);
              Alert.alert('Erro', 'Erro ao processar retirada. Tente novamente.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleClose = () => {
    onClose();
  };

  const formatarSaldo = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
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
          {/* Handle do modal */}
          <View style={styles.handle} />
          
          {/* Conteúdo */}
          <View style={styles.content}>
            <Text style={styles.title}>Retirar Dinheiro</Text>
            
            {/* Saldo atual */}
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Saldo disponível</Text>
              <Text style={styles.balanceValue}>{formatarSaldo(currentBalance)}</Text>
            </View>
            
            <View style={styles.separator} />
            
            {/* Informações */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Informações importantes:</Text>
              <Text style={styles.infoText}>• O valor será transferido para sua conta cadastrada</Text>
              <Text style={styles.infoText}>• Após confirmar, seu saldo será zerado</Text>
              <Text style={styles.infoText}>• O processamento pode levar até 2 dias úteis</Text>
            </View>
            
            <View style={styles.separator} />
            
          </View>
          
          {/* Botões fixos na parte inferior */}
          <View style={styles.fixedBottomContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.withdrawButton, loading && styles.withdrawButtonDisabled]} 
              onPress={handleWithdraw}
              activeOpacity={0.8}
              disabled={loading || currentBalance <= 0}
            >
              <Text style={styles.withdrawButtonText}>
                {loading ? 'Processando...' : 'Retirar'}
              </Text>
            </TouchableOpacity>
          </View>
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
    width: screenWidth * 0.9,
    height: screenHeight * 0.65,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  
  title: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#263238',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  
  balanceLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    marginBottom: 4,
  },
  
  balanceValue: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: '#455A64',
  },
  
  separator: {
    height: 1,
    backgroundColor: '#D9C0E7',
    marginVertical: 16,
  },
  
  infoContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    marginBottom: 8,
  },
  
  infoText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#455A64',
    marginBottom: 4,
  },
  
  withdrawContainer: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9C0E7',
  },
  
  withdrawLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#4E0777',
    marginBottom: 4,
  },
  
  withdrawValue: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
  },
  
  fixedBottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
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
    gap: 12,
  },
  
  cancelButton: {
    flex: 1,
    height: 41,
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9C0E7',
  },
  
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#4E0777',
  },
  
  withdrawButton: {
    flex: 1,
    height: 41,
    backgroundColor: '#D9C0E7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  withdrawButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  
  withdrawButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#4E0777',
  },
});

export default WithdrawModal;