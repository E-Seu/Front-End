import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, FlatList} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FavoritosIcon from '../../assets/icons/favoritosIcon';
import OpcoesIcon from '../../assets/icons/opcoesIcon';
import NotificacaoIcon from '../../assets/icons/notificacaoIcon';
import RestaurantItem from '../../components/RestaurantItem';
import { useAuth } from '../../context/AuthContext';
import RestaurantService from '../../services/RestaurantService';
import ClienteService from '../../services/ClienteService';
import LoginService from '../../services/LoginService';

const ClienteHome = () => {
  const navigation = useNavigation();
  const { userName, user } = useAuth();
  
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [clienteData, setClienteData] = useState(null);

  // Carregar dados quando o componente montar
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados do usuário atual
      const currentUser = await LoginService.getCurrentUser();
      console.log('👤 Usuário atual:', currentUser);
      
      if (currentUser.success && currentUser.user) {
        // Carregar dados específicos do cliente
        const cliente = await ClienteService.getCliente(currentUser.user.id);
        console.log('🛒 Dados do cliente:', cliente);
        setClienteData(cliente);
        
        // Carregar favoritos do cliente
        const favoritosData = await ClienteService.listarFavoritos(currentUser.user.id);
        console.log('❤️ Favoritos do cliente:', favoritosData);
        setFavorites(new Set(favoritosData.favoritos));
      }
      
      // Carregar restaurantes
      await loadRestaurants();
    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurants = async () => {
    try {
      const restaurantsData = await RestaurantService.getAllRestaurants();
      console.log('🍽️ Restaurantes carregados:', restaurantsData.length);
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error('❌ Erro ao carregar restaurantes:', error);
    }
  };

  const handleFavoritosPress = () => {
    // Criar lista de restaurantes favoritos
    const favoritedRestaurants = restaurants
      .filter(restaurant => favorites.has(restaurant.id))
      .map(restaurant => ({
        ...restaurant,
        isFavorite: true
      }));
    
    console.log('❤️ Navegando para favoritos:', favoritedRestaurants.length, 'restaurantes');
    
    navigation.navigate('ClienteFavoritos', { 
      favoritedRestaurants: favoritedRestaurants,
      onUpdateFavorites: handleFavoritedPress
    });
  };

  const handleOpcoesPress = () => {
    console.log('⚙️ Opções pressionado');
    // Aqui você pode navegar para uma tela de configurações
    // navigation.navigate('ClienteConfiguracoes');
  };

  const handleNotificacaoPress = () => {
    console.log('🔔 Notificação pressionado');
    // Aqui você pode navegar para uma tela de notificações
    // navigation.navigate('ClienteNotificacoes');
  };

  const handleFavoritedPress = async (restaurantId, isFavorite) => {
    try {
      const currentUser = await LoginService.getCurrentUser();
      
      if (currentUser.success && currentUser.user) {
        if (isFavorite) {
          // Adicionar aos favoritos
          console.log('❤️ Adicionando restaurante aos favoritos:', restaurantId);
          await ClienteService.adicionarFavorito(currentUser.user.id, restaurantId);
        } else {
          // Remover dos favoritos
          console.log('💔 Removendo restaurante dos favoritos:', restaurantId);
          await ClienteService.removerFavorito(currentUser.user.id, restaurantId);
        }
        
        // Atualizar estado local
        setFavorites(prevFavorites => {
          const newFavorites = new Set(prevFavorites);
          if (isFavorite) {
            newFavorites.add(restaurantId);
          } else {
            newFavorites.delete(restaurantId);
          }
          return newFavorites;
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar favorito:', error);
    }
  };

  const handleRestaurantPress = (restaurant) => {
    console.log('🍽️ Restaurante pressionado:', restaurant.nome);
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
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Confira os restaurantes do campus!</Text>
    </View>
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
          <Text style={styles.loadingText}>Carregando dados...</Text>
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
        onRefresh={loadInitialData}
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

  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },

  title: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    marginBottom: 15,
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