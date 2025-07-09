import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ImageBackground, FlatList, ActivityIndicator } from 'react-native';
import RetornarIcon from '../../assets/icons/retornarIcon';
import OpcoesIcon from '../../assets/icons/opcoesIcon';
import EstrelaIcon from '../../assets/icons/estrelaIcon';
import ProductItem from '../../components/ProductItem';
import RestaurantService from '../../services/RestaurantService';

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
  
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carregar produtos do restaurante
  useEffect(() => {
    loadRestaurantProducts();
  }, [restaurant]);

  const loadRestaurantProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando produtos do restaurante:', restaurant?.restaurante_id || restaurant?.id);
      
      if (restaurant) {
        const restaurantId = restaurant.restaurante_id || restaurant.id;
        const productsList = await RestaurantService.getProductsByRestaurant(restaurantId);
        
        console.log('📦 Produtos carregados:', productsList);
        setProdutos(productsList || []);
      } else {
        console.log('❌ Nenhum restaurante foi passado como parâmetro');
        setProdutos([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para refresh (pull to refresh)
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRestaurantProducts();
    setRefreshing(false);
  };

  // Função para gerar um hash simples baseado no nome (mesma do RestaurantItem)
  const generateHash = (str) => {
    if (!str || typeof str !== 'string') {
      return 0;
    }
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
    const restaurantName = restaurant?.nome || 'Restaurante Padrão';
    const hash = generateHash(restaurantName);
    const imageIndex = hash % restaurantImages.length;
    return restaurantImages[imageIndex];
  }, [restaurant?.nome]);

  // Usar as informações reais do restaurante com os nomes corretos da API
  const restaurantDetails = {
    nome: restaurant?.nome || "Nome do Restaurante",
    info: restaurant?.info || "Informações do restaurante",
    local: restaurant?.local || restaurant?.localizacao || "Local do restaurante", // Suporte para ambos os nomes
    horarioAbertura: restaurant?.horario_abertura || "08:00",
    horarioFechamento: restaurant?.horario_fechamento || "22:00",
    numeroEstrelas: restaurant?.numero_estrelas || restaurant?.avaliacao || 4.5, // Suporte para ambos os nomes
    isAberto: restaurant?.disponivel !== undefined ? restaurant.disponivel : true,
    telefone: restaurant?.telefone || "",
    tipo_restaurante: restaurant?.tipo_restaurante || "",
    saldo: restaurant?.saldo || 0
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
    return restaurantDetails.isAberto ? "Disponível" : "Indisponível";
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

  // Renderizar cada item de produto com campos corretos da API
  const renderProductItem = ({ item }) => (
    <ProductItem
      nome={item.nome}
      descricao={item.descricao}
      valor={item.valor}
      restricoes={item.restricoes || []}
      disponivel={item.disponivel}
      tempo_preparo={item.tempo_preparo} // Campo adicional da API
      onQuantityChange={(quantidade) => handleQuantityChange(item.id || item.produto_id, quantidade)}
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
      <View style={styles.sectionTitle}>
      </View>
    </View>
  );

  // Componente de loading
  const LoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#8B0BD5" />
      <Text style={styles.loadingText}>Carregando produtos...</Text>
    </View>
  );

  // Componente para lista vazia
  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {restaurantDetails.isAberto 
          ? "Este restaurante ainda não possui produtos cadastrados."
          : "Este restaurante está indisponível no momento."
        }
      </Text>
    </View>
  );

  // Se estiver carregando, mostrar loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <ImageBackground 
            source={getImageForRestaurant} 
            style={styles.backgroundImage}
            imageStyle={styles.imageStyle}
          >
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

            <View style={[styles.infoCard, getCardStyles()]}>
              <Text style={[styles.restaurantName, { color: getTextColor() }]}>
                {restaurantDetails.nome}
              </Text>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </ImageBackground>
        </View>
        <LoadingComponent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={produtos}
        renderItem={renderProductItem}
        keyExtractor={(item) => (item.id || item.produto_id).toString()}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        removeClippedSubviews={false} // Melhor performance
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
    gap: 6,
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
  },

  horarioText: {
    fontSize: 14,
    fontFamily: 'Nunito-Medium',
    textAlign: 'center',
  },

  avaliacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avaliacaoText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    marginLeft: 6,
  },

  // Novos estilos para campos adicionais
  tipoText: {
    fontSize: 12,
    fontFamily: 'Nunito-Medium',
    textAlign: 'center',
  },

  telefoneText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
  },

  statusText: {
    fontSize: 16,
    fontFamily: 'Nunito-Medium',
    textAlign: 'center',
  },

  sectionTitle: {
    marginTop: 70,
    marginBottom: 5,
    paddingHorizontal: 20,
  },

  sectionTitleText: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#222222',
    textAlign: 'center',
  },

  separator: {
    height: 8,
  },

  // Estilos para loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    gap: 10,
  },

  loadingText: {
    fontSize: 16,
    color: '#888888',
    fontFamily: 'Nunito-Regular',
  },

  // Estilo para lista vazia
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    marginTop: 50,
  },

  emptyText: {
    fontSize: 16,
    color: '#888888',
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ClienteRestauranteDetalhes;