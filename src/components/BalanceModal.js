import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import CustomInput from './CustomInput';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BalanceModal = ({ visible, onClose, onReload, currentBalance = 0 }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReload = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido para recarregar.');
      return;
    }

    const valor = parseFloat(amount);
    if (valor > 1000) {
      Alert.alert('Erro', 'O valor máximo para recarga é R$ 1.000,00');
      return;
    }

    try {
      setLoading(true);
      await onReload(valor);
      setAmount('');
      onClose();
    } catch (error) {
      console.error('Erro ao recarregar:', error);
      Alert.alert('Erro', 'Erro ao recarregar carteira. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  const formatarSaldo = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getNewBalance = () => {
    const valor = parseFloat(amount) || 0;
    return currentBalance + valor;
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
            
            {/* Conteúdo */}
            <View style={styles.content}>
              <Text style={styles.title}>Recarregar Carteira</Text>
              
              {/* Saldo atual */}
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Saldo atual</Text>
                <Text style={styles.balanceValue}>{formatarSaldo(currentBalance)}</Text>
              </View>
              
              <View style={styles.separator} />
              
              {/* Input do valor */}
              <Text style={styles.fieldLabel}>Valor para recarga</Text>
              <CustomInput
                placeholder="R$ 0,00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.inputContainer}
              />
              
              {/* Novo saldo */}
              {amount && parseFloat(amount) > 0 && (
                <View style={styles.newBalanceContainer}>
                  <Text style={styles.newBalanceLabel}>Novo saldo</Text>
                  <Text style={styles.newBalanceValue}>{formatarSaldo(getNewBalance())}</Text>
                </View>
              )}
              
              {/* Informação sobre limite */}
              <Text style={styles.limitInfo}>Valor máximo por recarga: R$ 1.000,00</Text>
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
                style={[styles.reloadButton, loading && styles.reloadButtonDisabled]} 
                onPress={handleReload}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={styles.reloadButtonText}>
                  {loading ? 'Carregando...' : 'Recarregar'}
                </Text>
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
    width: screenWidth * 0.9,
    height: screenHeight * 0.55,
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
  
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    marginBottom: 8,
  },
  
  inputContainer: {
    marginBottom: 16,
  },
  
  newBalanceContainer: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9C0E7',
  },
  
  newBalanceLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#4E0777',
    marginBottom: 4,
  },
  
  newBalanceValue: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
  },
  
  limitInfo: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    textAlign: 'center',
    marginTop: 'auto',
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
  
  reloadButton: {
    flex: 1,
    height: 41,
    backgroundColor: '#D9C0E7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  reloadButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  
  reloadButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#4E0777',
  },
});

export default BalanceModal;