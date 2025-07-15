import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ProductAvailabilityIcon from '../assets/icons/productAvailabilityIcon';
import EditarIcon from '../assets/icons/editarIcon';
import DeletarIcon from '../assets/icons/deletarIcon';

const RestaurantProductItem = ({ 
  produto_id,
  restaurante_id,
  nome = "Nome do Produto",
  descricao = "Descrição do produto",
  valor = 0,
  preco = 0,
  tempo_preparo = 0,
  disponivel = true,
  selos = {},
  onAvailabilityToggle,
  onEditPress,
  onDeletePress
}) => {
  // Usar preco se valor for 0 ou undefined
  const valorFinal = valor || preco || 0;

  const handleAvailabilityToggle = () => {
    if (onAvailabilityToggle) {
      onAvailabilityToggle(produto_id, disponivel);
    }
  };

  const handleEditPress = () => {
    if (onEditPress) {
      onEditPress({
        produto_id,
        restaurante_id,
        nome,
        descricao,
        valor: valorFinal,
        tempo_preparo,
        disponivel,
        selos
      });
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o produto "${nome}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            if (onDeletePress) {
              onDeletePress(produto_id);
            }
          }
        }
      ]
    );
  };

  const formatarValor = (valor) => {
    let valorNumerico;
    
    if (valor === null || valor === undefined) {
      valorNumerico = 0;
    } else if (typeof valor === 'string') {
      valorNumerico = parseFloat(valor);
    } else if (typeof valor === 'number') {
      valorNumerico = valor;
    } else if (typeof valor === 'object' && valor !== null) {
      valorNumerico = parseFloat(valor.toString());
    } else {
      valorNumerico = parseFloat(valor) || 0;
    }
    
    if (isNaN(valorNumerico)) {
      valorNumerico = 0;
    }
    
    return `R$ ${valorNumerico.toFixed(2).replace('.', ',')}`;
  };

  return (
    <View style={styles.container}>
      {/* Conteúdo principal */}
      <View style={styles.mainContent}>
        {/* Lado esquerdo - Informações do produto */}
        <View style={styles.infoContainer}>
          <Text style={styles.nome} numberOfLines={2}>
            {nome}
          </Text>
          <Text style={styles.descricao} numberOfLines={3}>
            {descricao}
          </Text>
          <Text style={styles.valor}>
            {formatarValor(valorFinal)}
          </Text>
        </View>

        {/* Lado direito - Botão de disponibilidade e ações */}
        <View style={styles.rightContainer}>
          {/* Botão de disponibilidade */}
          <TouchableOpacity 
            style={styles.availabilityButton}
            onPress={handleAvailabilityToggle}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.availabilityText,
              disponivel ? styles.availableText : styles.unavailableText
            ]}>
              {disponivel ? 'Disponível' : 'Indisponível'}
            </Text>
            <ProductAvailabilityIcon 
              width={53} 
              height={22} 
              isAvailable={disponivel} 
            />
          </TouchableOpacity>

          {/* Botões de ação */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleDeletePress}
              activeOpacity={0.7}
            >
              <DeletarIcon width={14} height={16} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleEditPress}
              activeOpacity={0.7}
            >
              <EditarIcon width={14} height={14} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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

  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 80,
  },

  infoContainer: {
    flex: 1,
    paddingRight: 15,
    justifyContent: 'space-between',
  },

  nome: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#222222',
    marginBottom: 4,
    lineHeight: 20,
  },

  descricao: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    marginTop: 5,
    lineHeight: 18,
    flex: 1,
  },

  valor: {
    fontSize: 14,
    fontFamily: 'Nunito-Medium',
    color: '#4E0777',
    marginTop: 10,
  },

  rightContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    minHeight: 80,
    width: 120,
  },

  availabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  availabilityText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
  },

  availableText: {
    color: '#9747FF',
    fontFamily: 'Nunito-SemiBold',
  },

  unavailableText: {
    color: '#D9C0E7',
    fontFamily: 'Nunito-Bold',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EADEF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RestaurantProductItem;