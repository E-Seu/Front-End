import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import RestaurantItem from '../../components/RestaurantItem';
import RetornarIcon from '../../assets/icons/retornarIcon';

const ClienteFavoritos = ({ navigation, route }) => {
  // Receber os restaurantes favoritos da tela anterior
  const { favoritedRestaurants = [], onUpdateFavorites } = route.params || {};
  
  // Estado local para gerenciar a lista de favoritos
  const [localFavorites, setLocalFavorites] = useState(favoritedRestaurants);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleFavoritePress = (restaurantId, isFavorite) => {
    if (!isFavorite) {
      // Se desfavoritou, remover da lista local
      setLocalFavorites(prev => prev.filter(restaurant => restaurant.id !== restaurantId));
      
      // Atualizar também na tela principal através do callback
      if (onUpdateFavorites) {
        onUpdateFavorites(restaurantId, false);
      }
    } else {
      // Se favoritou novamente, atualizar o estado local
      setLocalFavorites(prev => 
        prev.map(restaurant => 
          restaurant.id === restaurantId 
            ? { ...restaurant, isFavorite: true }
            : restaurant
        )
      );
      
      // Atualizar também na tela principal
      if (onUpdateFavorites) {
        onUpdateFavorites(restaurantId, true);
      }
    }
    
    console.log(`Restaurante ${restaurantId} favorito: ${isFavorite}`);
  };

  const handleRestaurantPress = (restaurant) => {
    console.log('Restaurante pressionado:', restaurant.nome);
    // Navegar para a tela de detalhes do restaurante
    navigation.navigate('RestauranteDetalhes', { restaurant });
  };


  const renderRestaurantItem = ({ item }) => (
    <RestaurantItem
      nome={item.nome}
      info={item.info}
      local={item.local}
      isFavorite={item.isFavorite}
      onFavoritePress={(isFav) => handleFavoritePress(item.id, isFav)}
      onPress={() => handleRestaurantPress(item)}
    />
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhum restaurante favoritado</Text>
      <Text style={styles.emptySubtext}>Favorite alguns restaurantes para vê-los aqui!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
        >
          <RetornarIcon width={24} height={24} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>FAVORITOS</Text>
        
        {/* Espaço vazio para centralizar o título */}
        <View style={styles.placeholder} />
      </View>

      {/* Lista de restaurantes favoritos */}
      <FlatList
        data={localFavorites}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyComponent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEDCF9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    textAlign: 'center',
  },

  placeholder: {
    width: 40,
    height: 40,
  },

  listContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },

  emptyText: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    color: '#F03800',
    textAlign: 'center',
    marginBottom: 10,
  },

  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#888888',
    textAlign: 'center',
  },
});

export default ClienteFavoritos;