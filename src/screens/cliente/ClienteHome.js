import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, FlatList} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FavoritosIcon from '../../assets/icons/favoritosIcon';
import OpcoesIcon from '../../assets/icons/opcoesIcon';
import NotificacaoIcon from '../../assets/icons/notificacaoIcon';
import RestaurantItem from '../../components/RestaurantItem';
import { useAuth } from '../../context/AuthContext';
import RestaurantService from '../../services/RestaurantService';

const ClienteHome = () => {
  const navigation = useNavigation();
  const { userName } = useAuth();
  
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  // Carregar restaurantes quando o componente montar
  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const restaurantsData = await RestaurantService.getAllRestaurants();
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoritosPress = () => {
    // Criar lista de restaurantes favoritos com a propriedade isFavorite correta
    const favoritedRestaurants = restaurants
      .filter(restaurant => favorites.has(restaurant.id))
      .map(restaurant => ({
        ...restaurant,
        isFavorite: true // Garantir que está marcado como favorito
      }));
    
    navigation.navigate('ClienteFavoritos', { 
      favoritedRestaurants: favoritedRestaurants,
      onUpdateFavorites: handleFavoritedPress
    });
  };

  const handleOpcoesPress = () => {
    console.log('Opções pressionado');
  };

  const handleNotificacaoPress = () => {
    console.log('Notificação pressionado');
  };

  const handleFavoritedPress = (restaurantId, isFavorite) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (isFavorite) {
        newFavorites.add(restaurantId);
      } else {
        newFavorites.delete(restaurantId);
      }
      return newFavorites;
    });
    console.log(`Restaurante ${restaurantId} favorito: ${isFavorite}`);
  };

  const handleRestaurantPress = (restaurant) => {
    console.log('Restaurante pressionado:', restaurant.nome);
    navigation.navigate('RestauranteDetalhes', { restaurant });
  };

  const renderRestaurantItem = ({ item }) => (
    <RestaurantItem
      nome={item.nome}
      info={item.info}
      local={item.local}
      isFavorite={favorites.has(item.id)}
      onFavoritePress={(isFav) => handleFavoritedPress(item.id, isFav)}
      onPress={() => handleRestaurantPress(item)}
    />
  );

  const ListHeader = () => (
    <Text style={styles.title}>Confira os restaurantes do campus!</Text>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Olá, {userName}!</Text>
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={handleFavoritosPress}>
              <FavoritosIcon width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleOpcoesPress}>
              <OpcoesIcon width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleNotificacaoPress}>
              <NotificacaoIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0BD5" />
          <Text style={styles.loadingText}>Carregando restaurantes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Olá, {userName}!</Text>
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleFavoritosPress}
          >
            <FavoritosIcon width={24} height={24} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleOpcoesPress}
          >
            <OpcoesIcon width={24} height={24} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleNotificacaoPress}
          >
            <NotificacaoIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de restaurantes */}
      <FlatList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadRestaurants}
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

  welcomeContainer: {
    flex: 1,
  },

  welcomeText: {
    fontSize: 16,
    color: '#222222',
    fontFamily: 'Nunito-Regular',
  },

  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEDCF9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  title: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    marginBottom: 15,
    marginTop: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  loadingText: {
    fontSize: 16,
    color: '#888888',
    fontFamily: 'Nunito-Regular',
  },
});

export default ClienteHome;