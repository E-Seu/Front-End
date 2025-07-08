import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ImageBackground, FlatList } from 'react-native';
import RetornarIcon from '../../assets/icons/retornarIcon';
import OpcoesIcon from '../../assets/icons/opcoesIcon';
import EstrelaIcon from '../../assets/icons/estrelaIcon';
import ProductItem from '../../components/ProductItem';

// Imagens genéricas para restaurantes (mesmo array do RestaurantItem)
const restaurantImages = [
  require('../../assets/images/restaurantImages/RestauranteImageBlue.png'),
  require('../../assets/images/restaurantImages/RestauranteImageRed.png'),
  require('../../assets/images/restaurantImages/RestauranteImageGreen.png'),
  require('../../assets/images/restaurantImages/RestauranteImageOrange.png'),
  require('../../assets/images/restaurantImages/RestauranteImagePurple.png'),
];

const ClienteRestauranteDetalhes = ({ navigation, route }) => {
  const { restaurant } = route.params || {};

  // Mock data para produtos do restaurante
  const [produtos, setProdutos] = useState([
    {
      id: 1,
      nome: "X-Burger Especial",
      descricao: "Hambúrguer artesanal com carne 180g, queijo cheddar, bacon, alface, tomate e molho especial da casa",
      valor: 28.90,
      restricoes: []
    },
    {
      id: 2,
      nome: "Pizza Margherita Vegana",
      descricao: "Pizza tradicional com molho de tomate, queijo vegano, manjericão fresco e azeite extravirgem",
      valor: 32.50,
      restricoes: ['vegan', 'lactoseFree']
    },
    {
      id: 3,
      nome: "Salada Caesar Sem Glúten",
      descricao: "Mix de folhas verdes, croutons sem glúten, parmesão, molho caesar e peito de frango grelhado",
      valor: 24.00,
      restricoes: ['glutenFree']
    },
    {
      id: 4,
      nome: "Açaí Bowl Completo",
      descricao: "Açaí puro batido com banana, granola caseira, frutas da estação, mel e castanhas",
      valor: 18.50,
      restricoes: ['vegan', 'glutenFree', 'lactoseFree']
    },
    {
      id: 5,
      nome: "Wrap de Frango Grelhado",
      descricao: "Tortilha integral com frango desfiado, queijo, alface, tomate, cenoura e molho iogurte",
      valor: 22.90,
      restricoes: []
    },
    {
      id: 6,
      nome: "Brownie Vegano",
      descricao: "Brownie de chocolate amargo sem ingredientes de origem animal, servido com sorvete vegano",
      valor: 15.00,
      restricoes: ['vegan', 'lactoseFree']
    },
    {
      id: 7,
      nome: "Suco Natural Detox",
      descricao: "Blend de couve, maçã verde, limão, gengibre e água de coco natural",
      valor: 12.00,
      restricoes: ['vegan', 'glutenFree', 'lactoseFree', 'peanutFree']
    },
    {
      id: 8,
      nome: "Lasanha Sem Lactose",
      descricao: "Lasanha de berinjela com molho bolonhesa, queijo sem lactose e manjericão",
      valor: 26.50,
      restricoes: ['lactoseFree']
    }
  ]);

  // Função para gerar um hash simples baseado no nome (mesma do RestaurantItem)
  const generateHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // converter para inteiro de 32 bits
    }
    return Math.abs(hash);
  };

  // Seleciona a mesma imagem que o RestaurantItem
  const getImageForRestaurant = useMemo(() => {
    const hash = generateHash(restaurant?.nome || '');
    const imageIndex = hash % restaurantImages.length;
    return restaurantImages[imageIndex];
  }, [restaurant?.nome]);

  // Usar as informações reais do restaurante
  const restaurantDetails = {
    nome: restaurant?.nome || "Nome do Restaurante",
    info: restaurant?.info || "Informações do restaurante",
    local: restaurant?.local || "Local do restaurante",
    horarioAbertura: restaurant?.horarioAbertura || "08:00",
    horarioFechamento: restaurant?.horarioFechamento || "22:00",
    numeroEstrelas: restaurant?.numeroEstrelas || 4.5,
    isAberto: restaurant?.isAberto !== undefined ? restaurant.isAberto : true,
    isFavorite: restaurant?.isFavorite || false
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleOpcoesPress = () => {
    console.log('Opções do restaurante pressionado');
  };

  const handleQuantityChange = (productId, quantidade) => {
    console.log(`Produto ${productId}: quantidade ${quantidade}`);
    // Aqui você pode implementar a lógica para gerenciar o carrinho
  };

  const getStatusText = () => {
    return restaurantDetails.isAberto ? "Aberto" : "Fechado";
  };

  const getStatusColor = () => {
    return restaurantDetails.isAberto ? "#8B0BD5" : "#888888";
  };

  // Função para obter estilos dinâmicos baseados no status
  const getCardStyles = () => {
    if (restaurantDetails.isAberto) {
      return {
        backgroundColor: '#FFFFFF',
        borderColor: '#DFDCDC',
        shadowColor: '#DFDCDC',
      };
    } else {
      return {
        backgroundColor: '#F2F2F2',
        borderColor: '#888888',
        shadowColor: '#F3EFEF',
      };
    }
  };

  const getTextColor = () => {
    return restaurantDetails.isAberto ? '#222222' : '#888888';
  };

  const getSecondaryTextColor = () => {
    return restaurantDetails.isAberto ? '#888888' : '#888888';
  };

  const getAvaliacaoTextColor = () => {
    return restaurantDetails.isAberto ? '#FF7F23' : '#888888';
  };

  // Renderizar cada item de produto
  const renderProductItem = ({ item }) => (
    <ProductItem
      nome={item.nome}
      descricao={item.descricao}
      valor={item.valor}
      restricoes={item.restricoes}
      onQuantityChange={(quantidade) => handleQuantityChange(item.id, quantidade)}
    />
  );

  // Header da lista de produtos
  const ListHeader = () => (
    <View>
      {/* Header com imagem de fundo */}
      <View style={styles.headerContainer}>
        <ImageBackground 
          source={getImageForRestaurant} 
          style={styles.backgroundImage}
          imageStyle={styles.imageStyle}
        >
          {/* Header com botões */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleBackPress}
            >
              <RetornarIcon width={24} height={24} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleOpcoesPress}
            >
              <OpcoesIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* Card de informações do restaurante */}
          <View style={[styles.infoCard, getCardStyles()]}>
            <Text style={[styles.restaurantName, { color: getTextColor() }]} numberOfLines={2}>
              {restaurantDetails.nome}
            </Text>
            
            <Text style={[styles.horarioText, { color: getSecondaryTextColor() }]}>
              Aberto de {restaurantDetails.horarioAbertura} às {restaurantDetails.horarioFechamento}
            </Text>
            
            <View style={styles.avaliacaoContainer}>
              <EstrelaIcon width={16} height={16} isActive={restaurantDetails.isAberto} />
              <Text style={[styles.avaliacaoText, { color: getAvaliacaoTextColor() }]}>
                {restaurantDetails.numeroEstrelas} Estrelas
              </Text>
            </View>
            
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Título da seção de produtos */}
      <Text style={styles.sectionTitle}>Cardápio</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={produtos}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  listContainer: {
    paddingBottom: 20,
  },

  headerContainer: {
    height: 150,
  },

  backgroundImage: {
    flex: 1,
    justifyContent: 'space-between',
  },

  imageStyle: {
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 1,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEDCF9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoCard: {
    marginHorizontal: 35,
    marginTop: 30,
    borderRadius: 8,
    borderWidth: 0.5,
    padding: 8,
    alignItems: 'center',
    elevation: 5,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },

  restaurantName: {
    fontSize: 18,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },

  horarioText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },

  avaliacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  avaliacaoText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    marginLeft: 6,
  },

  statusText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
    color: '#888888',
    marginTop: 80,
    marginBottom: 5,
    marginHorizontal: 20,
  },

  separator: {
    height: 8,
  },

});

export default ClienteRestauranteDetalhes;