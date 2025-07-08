import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import CoracaoIcon from '../assets/icons/coracaoIcon';

// Imagens genéricas para restaurantes
const restaurantImages = [
  require('../assets/images/restaurantImages/RestauranteImageBlue.png'),
  require('../assets/images/restaurantImages/RestauranteImageRed.png'),
  require('../assets/images/restaurantImages/RestauranteImageGreen.png'),
  require('../assets/images/restaurantImages/RestauranteImageOrange.png'),
  require('../assets/images/restaurantImages/RestauranteImagePurple.png'),
];

const RestaurantItem = ({ 
  nome = "Nome do Restaurante", 
  info = "Informações específicas", 
  local = "Local do Restaurante",
  isFavorite = false,
  onFavoritePress,
  onPress
}) => {
  const [favorite, setFavorite] = useState(isFavorite);

  // Sincronizar o estado local com a prop isFavorite sempre que ela mudar
  useEffect(() => {
    setFavorite(isFavorite);
  }, [isFavorite]);

  // Função para gerar um hash simples baseado no nome
  const generateHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // Seleciona uma imagem baseada no nome do restaurante
  const getImageForRestaurant = useMemo(() => {
    const hash = generateHash(nome);
    const imageIndex = hash % restaurantImages.length;
    return restaurantImages[imageIndex];
  }, [nome]);

  const handleFavoritePress = () => {
    const newFavoriteState = !favorite;
    setFavorite(newFavoriteState);
    if (onFavoritePress) {
      onFavoritePress(newFavoriteState);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <ImageBackground 
        source={getImageForRestaurant} 
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        
        {/* Conteúdo do restaurante */}
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.nome} numberOfLines={1}>
              {nome}
            </Text>
            <Text style={styles.info} numberOfLines={1}>
              {info}
            </Text>
            <Text style={styles.local} numberOfLines={1}>
              {local}
            </Text>
          </View>
          
          {/* Ícone de coração */}
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            activeOpacity={0.7}
          >
            <CoracaoIcon 
              isActive={favorite} 
              width={45} 
              height={45} 
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 360,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },

  imageStyle: {
    borderRadius: 12,
  },

  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    zIndex: 1,
  },

  textContainer: {
    flex: 1,
    marginRight: 12,
  },

  nome: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Nunito-ExtraBold',
    marginBottom: 4,
    marginLeft: 15,
    //textShadowColor: 'rgba(0, 0, 0, 0.5)',
    //textShadowOffset: { width: 1, height: 1 },
    //textShadowRadius: 2,
  },

  info: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
    marginBottom: 4,
    marginLeft: 15,
    //textShadowColor: 'rgba(0, 0, 0, 0.5)',
    //textShadowOffset: { width: 1, height: 1 },
    //textShadowRadius: 2,
  },

  local: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Nunito-SemiBold',
    marginLeft: 15,
    //textShadowColor: 'rgba(0, 0, 0, 0.5)',
    //textShadowOffset: { width: 1, height: 1 },
    //textShadowRadius: 2,
  },

  favoriteButton: {
    alignSelf: 'center',
    padding: 4,
  },
});

export default RestaurantItem;