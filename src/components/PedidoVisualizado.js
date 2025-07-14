import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PedidoVisualizado = ({
  onClose,
  nomeRestaurante = 'Restaurante',
  localizacao = 'Não informado',
  precoTotal = 0,
  status = '',
  nomeEntregador = '',
  itens = [],
}) => {
  const renderItens = () => {
    if (!Array.isArray(itens) || itens.length === 0) {
      return (
        <Text style={styles.emptyCartText}>Nenhum item no pedido.</Text>
      );
    }
    return itens.map((item, idx) => (
      <View key={idx} style={styles.cartItem}>
        <View style={styles.itemNameContainer}>
          <Text style={styles.itemQuantity}>{item.quantidade || item.qtd || item.quant || 1}x</Text>
          <Text style={styles.itemName}>{item.nome || item.nome_produto || item.produto}</Text>
        </View>
        <Text style={styles.itemPrice}>
          R$ {Number(item.preco || item.valor || item.preco_unitario || 0).toFixed(2)}
        </Text>
      </View>
    ));
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
            <Text style={styles.restaurantName}>{nomeRestaurante}</Text>

            <Text style={styles.label}>Itens do pedido:</Text>
            <View style={styles.itemsContainer}>
              {renderItens()}
            </View>

            <View style={styles.separator} />

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalText}>R$ {Number(precoTotal).toFixed(2)}</Text>
            </View>

            <Text style={styles.label}>Local de entrega:</Text>
            <Text style={styles.resumoText}>{localizacao}</Text>

            {status === 'a_caminho' && nomeEntregador ? (
              <>
                <Text style={styles.label}>Entregador:</Text>
                <Text style={styles.resumoText}>{nomeEntregador}</Text>
              </>
            ) : null}
          </ScrollView>
          <TouchableOpacity
            style={styles.fecharButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.fecharButtonText}>Fechar</Text>
          </TouchableOpacity>
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
    marginBottom: 24,
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
  restaurantName: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    marginTop: 12,
    marginBottom: 2,
  },
  itemsContainer: {
    marginBottom: 10,
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
  resumoText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666666',
    marginBottom: 4,
  },
  emptyCartText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#888888',
    textAlign: 'center',
    marginBottom: 8,
  },
  fecharButton: {
    backgroundColor: '#4E0777',
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 16,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  fecharButtonText: {
    color: '#FFF',
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
  },
});

export default PedidoVisualizado;