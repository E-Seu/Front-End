import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MaisIcon from '../assets/icons/maisIcon';
import MenosIcon from '../assets/icons/menosIcon';

const ProductItem = ({ 
  nome = "Nome do Produto",
  descricao = "Descrição do produto",
  valor = 0,
  restricoes = [], // Array com as restrições: ['vegan', 'glutenFree', 'peanutFree', 'lactoseFree']
  onQuantityChange
}) => {
  const [quantidade, setQuantidade] = useState(0);
  const [maisPressionado, setMaisPressionado] = useState(false);
  const [menosPressionado, setMenosPressionado] = useState(false);

  // Mapeamento das imagens de restrições
  const restricaoImages = {
    vegan: require('../assets/Vegan.png'),
    glutenFree: require('../assets/GlutenFree.png'),
    peanutFree: require('../assets/PeanutFree.png'),
    lactoseFree: require('../assets/LactoseFree.png'),
  };

  const handleMais = () => {
    const novaQuantidade = quantidade + 1;
    setQuantidade(novaQuantidade);
    if (onQuantityChange) {
      onQuantityChange(novaQuantidade);
    }
  };

  const handleMenos = () => {
    if (quantidade > 0) {
      const novaQuantidade = quantidade - 1;
      setQuantidade(novaQuantidade);
      if (onQuantityChange) {
        onQuantityChange(novaQuantidade);
      }
    }
  };

  const formatarValor = (valor) => {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  };

  // Determinar se os ícones devem estar na versão colorida
  const shouldShowColoredIcons = quantidade > 0;

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
            {formatarValor(valor)}
          </Text>
        </View>

        {/* Lado direito - Restrições e controles */}
        <View style={styles.rightContainer}>
          {/* Restrições alimentares */}
          {restricoes.length > 0 && (
            <View style={styles.restricoesContainer}>
              {restricoes.map((restricao, index) => (
                <Image
                  key={index}
                  source={restricaoImages[restricao]}
                  style={styles.restricaoIcon}
                />
              ))}
            </View>
          )}

          {/* Controles de quantidade */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPressIn={() => setMenosPressionado(true)}
              onPressOut={() => setMenosPressionado(false)}
              onPress={handleMenos}
              style={[styles.quantityButton, quantidade === 0 && styles.disabledButton]}
              disabled={quantidade === 0}
            >
              <MenosIcon 
                isPressed={shouldShowColoredIcons || (menosPressionado && quantidade > 0)} 
                width={24} 
                height={24} 
              />
            </TouchableOpacity>

            <Text style={styles.quantityText}>
              {quantidade}
            </Text>

            <TouchableOpacity
              onPressIn={() => setMaisPressionado(true)}
              onPressOut={() => setMaisPressionado(false)}
              onPress={handleMais}
              style={styles.quantityButton}
            >
              <MaisIcon 
                isPressed={shouldShowColoredIcons || maisPressionado} 
                width={24} 
                height={24} 
              />
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
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#222222',
    marginBottom: 4,
    lineHeight: 20,
  },

  descricao: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    marginTop: 5,
    lineHeight: 15,
    flex: 1, 
  },

  valor: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    marginTop: 10,
  },

  rightContainer: {
    justifyContent: 'space-between', 
    alignItems: 'flex-end',
    minHeight: 80, 
    width: 100, 
  },

  restricoesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 100, 
  },

  restricaoIcon: {
    width: 18, 
    height: 18,
    marginLeft: 2,
    marginBottom: 2,
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
  },

  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.5,
  },

  quantityText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#E96200',
    minWidth: 20,
    textAlign: 'center',
  },
});

export default ProductItem;