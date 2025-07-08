import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FavoritosIcon from '../../assets/icons/favoritosIcon';
import OpcoesIcon from '../../assets/icons/opcoesIcon';
import NotificacaoIcon from '../../assets/icons/notificacaoIcon';
import RestaurantItem from '../../components/RestaurantItem';

const RestauranteHome = () => {
  const navigation = useNavigation(); // Usar hook ao invés de prop
  const nomeRestaurante = 'Restaurante'; // Placeholder

  // Estado para gerenciar os favoritos (mock)
  const [restaurants, setRestaurants] = useState([
    {
      id: 1,
      nome: "Comida Paixão - Feito com amor",
      info: "Comida caseira",
      local: "PPGCC",
      isFavorite: false
    },
    {
      id: 2,
      nome: "Espetinhos Gente Fina",
      info: "Grelhados",
      local: "Praça de Alimentação",
      isFavorite: false
    },
    {
      id: 3,
      nome: "Cantinazinhainha",
      info: "Lanches e sucos",
      local: "Bloco C - 1º andar",
      isFavorite: false
    },
    {
      id: 4,
      nome: "Pizzaaaaa",
      info: "Pizzas individuais",
      local: "Centro de Convivência",
      isFavorite: false
    },
    {
      id: 5,
      nome: "Açaí do Íaça",
      info: "Açaí e vitaminas",
      local: "Quadra Poliesportiva",
      isFavorite: false
    },
    {
      id: 6,
      nome: "Burggers", 
      info: "Hambúrgueres artesanais",
      local: "Entrada Principal",
      isFavorite: false
    }
  ]);

  const handleFavoritosPress = () => {
    // Filtrar apenas os restaurantes favoritos
    const favoritedRestaurants = restaurants.filter(restaurant => restaurant.isFavorite);
    
    // Navegar para a tela de favoritos passando os restaurantes favoritos e callback
    navigation.navigate('RestauranteFavoritos', { 
      favoritedRestaurants: favoritedRestaurants,
      onUpdateFavorites: handleFavoritedPress // Passar a função de callback
    });
};

  const handleOpcoesPress = () => {
    console.log('Opções pressionado');
  };

  const handleNotificacaoPress = () => {
    console.log('Notificação pressionado');
  };

  const handleFavoritedPress = (restaurantId, isFavorite) => {
    // Atualizar o estado dos restaurantes
    setRestaurants(prevRestaurants => 
      prevRestaurants.map(restaurant => 
        restaurant.id === restaurantId 
          ? { ...restaurant, isFavorite: isFavorite }
          : restaurant
      )
    );
    console.log(`Restaurante ${restaurantId} favorito: ${isFavorite}`);
  };

  const handleRestaurantPress = (restaurant) => {
    console.log('Restaurante pressionado:', restaurant.nome);
  };

  const renderRestaurantItem = ({ item }) => (
    <RestaurantItem
      nome={item.nome}
      info={item.info}
      local={item.local}
      isFavorite={item.isFavorite}
      onFavoritePress={(isFav) => handleFavoritedPress(item.id, isFav)}
      onPress={() => handleRestaurantPress(item)}
    />
  );

  const ListHeader = () => (
    <Text style={styles.title}>Confira os restaurantes do campus!</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Olá, {nomeRestaurante}!</Text>
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

});

export default RestauranteHome;