import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ImageBackground, FlatList, ActivityIndicator } from 'react-native';
import RetornarIcon from '../../assets/icons/retornarIcon';
import OpcoesIcon from '../../assets/icons/opcoesIcon';
import EstrelaIcon from '../../assets/icons/estrelaIcon';
import ProductItem from '../../components/ProductItem';
import { useAuth } from '../../context/AuthContext';
import RestaurantService from '../../services/RestaurantService';

// Imagens genéricas para restaurantes (mesmo array do RestaurantItem)
const restaurantImages = [
  require('../../assets/images/restaurantImages/RestauranteImageBlue.png'),
  require('../../assets/images/restaurantImages/RestauranteImageRed.png'),
  require('../../assets/images/restaurantImages/RestauranteImageGreen.png'),
  require('../../assets/images/restaurantImages/RestauranteImageOrange.png'),
  require('../../assets/images/restaurantImages/RestauranteImagePurple.png'),
];

const RestauranteHome = ({ navigation, route }) => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  // Carregar dados do restaurante do usuário logado
  useEffect(() => {
    loadRestaurantData();
  }, [user]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      console.log('Carregando dados do restaurante para usuário:', user?.email);
      
      if (user?.email) {
        const userRestaurants = await RestaurantService.getRestaurantsByUser(user.email);
        
        if (userRestaurants && userRestaurants.length > 0) {
          const restaurantData = userRestaurants[0]; // Assumindo um restaurante por usuário
          console.log('Dados do restaurante carregados:', restaurantData);
          
          setRestaurant(restaurantData);
          
          // Buscar produtos específicos do restaurante através da API
          const productsList = await RestaurantService.getProductsByRestaurant(restaurantData.id || restaurantData.restaurante_id);
          setProdutos(productsList || restaurantData.produtos || []);
        } else {
          console.log('Nenhum restaurante encontrado para o usuário');
          setRestaurant(null);
          setProdutos([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do restaurante:', error);
      setRestaurant(null);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
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

const restaurantDetails = {
  nome: restaurant?.nome || "Nome do Restaurante",
  info: restaurant?.info || "Informações do restaurante",
  local: restaurant?.local || restaurant?.localizacao || "Local do restaurante", // Suporte para ambos
  horarioAbertura: restaurant?.horario_abertura || "08:00",
  horarioFechamento: restaurant?.horario_fechamento || "22:00",
  numeroEstrelas: restaurant?.numero_estrelas || restaurant?.avaliacao || 4.5, // Suporte para ambos
  isAberto: restaurant?.disponivel !== undefined ? restaurant.disponivel : true,
  telefone: restaurant?.telefone || "",
  tipo_restaurante: restaurant?.tipo_restaurante || "",
  saldo: restaurant?.saldo || 0
};

  const handleStatusToggle = async () => {
    if (restaurant && !statusLoading) {
      const newStatus = !restaurant.disponivel; // Mudança: usando disponivel
      
      try {
        setStatusLoading(true);
        console.log(`Alterando status do restaurante ${restaurant.id || restaurant.restaurante_id} para:`, newStatus);
        
        const restaurantId = restaurant.id || restaurant.restaurante_id;
        const updatedRestaurant = await RestaurantService.updateRestaurantStatus(restaurantId, newStatus);
        
        if (updatedRestaurant) {
          setRestaurant(prev => ({ ...prev, disponivel: newStatus })); // Mudança: usando disponivel
          console.log(`Status atualizado com sucesso para: ${newStatus ? 'Disponível' : 'Indisponível'}`);
        } else {
          console.error('Falha ao atualizar status do restaurante');
        }
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      } finally {
        setStatusLoading(false);
      }
    }
  };

  const handleBackPress = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  const handleOpcoesPress = () => {
    console.log('Opções do restaurante pressionado');
    // Aqui você pode navegar para uma tela de configurações do restaurante
  };

  const handleQuantityChange = (productId, quantidade) => {
    console.log(`Produto ${productId}: quantidade ${quantidade}`);
    // Aqui você pode implementar a lógica para gerenciar o estoque
    // Exemplo: atualizar disponibilidade do produto
    // RestaurantService.updateProductAvailability(restaurant.id, productId, quantidade > 0);
  };

  const getStatusText = () => {
    if (statusLoading) return "Atualizando...";
    return restaurantDetails.isAberto ? "Disponível" : "Indisponível"; // Mudança: texto mais claro
  };

  const getStatusColor = () => {
    if (statusLoading) return "#FFB800";
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
      valor={item.valor || item.preco} // Suporte para ambos os nomes
      restricoes={item.restricoes || []}
      disponivel={item.disponivel}
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
            
            {/* Botão para alternar status - funcionalidade específica do restaurante */}
            <TouchableOpacity 
              onPress={handleStatusToggle}
              disabled={statusLoading}
              style={[styles.statusButton, statusLoading && styles.statusButtonDisabled]}
            >
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()} {!statusLoading && "(Toque para alterar)"}
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
      <View style={styles.sectionTitle}></View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0BD5" />
          <Text style={styles.loadingText}>Carregando dados do restaurante...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Nenhum restaurante encontrado para este usuário ({user?.email})
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadRestaurantData}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
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
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={loading}
        onRefresh={loadRestaurantData}
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

  statusButton: {
    padding: 4,
  },

  statusButtonDisabled: {
    opacity: 0.6,
  },

  statusText: {
    fontSize: 16,
    fontFamily: 'Nunito-Medium',
    textAlign: 'center',
  },

  sectionTitle: {
    marginTop: 70,
    marginBottom: 5,
  },

  separator: {
    height: 8,
  },

  // Estilos para loading e erro
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

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },

  errorText: {
    fontSize: 16,
    color: '#888888',
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: '#8B0BD5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
  },
});

export default RestauranteHome;