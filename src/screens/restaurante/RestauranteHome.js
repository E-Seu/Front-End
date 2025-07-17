import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ImageBackground, FlatList, ActivityIndicator, Alert } from 'react-native';
import ConfigurationIcon from '../../assets/icons/configurationIcon';
import EstrelaIcon from '../../assets/icons/estrelaIcon';
import MaisIcon from '../../assets/icons/maisIcon';
import RestaurantProductItem from '../../components/RestaurantProductItem';
import AddProductModal from '../../components/AddProductModal';
import UpdateProductModal from '../../components/UpdateProductModal';
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
  // const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showUpdateProductModal, setShowUpdateProductModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
          setProdutos(productsList || []);
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
      setRefreshing(false);
    }
  };

  // Função para refresh (pull to refresh)
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRestaurantData();
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
    local: restaurant?.local || restaurant?.localizacao || "Local do restaurante",
    horarioAbertura: restaurant?.horario_abertura || "08:00",
    horarioFechamento: restaurant?.horario_fechamento || "22:00",
    numeroEstrelas: restaurant?.numero_estrelas || 0,
    isAberto: restaurant?.disponivel !== undefined ? restaurant.disponivel : true,
    telefone: restaurant?.telefone || "",
    tipo_restaurante: restaurant?.tipo_restaurante || "",
    saldo: restaurant?.saldo || 0
  };

  const handleStatusToggle = async () => {
    if (restaurant && !statusLoading) {
      const newStatus = !restaurant.disponivel;
      
      try {
        setStatusLoading(true);
        console.log(`Alterando status do restaurante ${restaurant.id || restaurant.restaurante_id} para:`, newStatus);
        
        const restaurantId = restaurant.id || restaurant.restaurante_id;
        const updatedRestaurant = await RestaurantService.updateRestaurantStatus(restaurantId, newStatus);
        
        if (updatedRestaurant) {
          setRestaurant(prev => ({ ...prev, disponivel: newStatus }));
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

  // const handleConfigurationPress = () => {
  //   console.log('Configurações do restaurante pressionado');
  //   setShowConfigModal(true);
  //   // TODO: Implementar modal de configurações
  // };

  const handleAddProductPress = () => {
    console.log('Adicionar produto pressionado');
    setShowAddProductModal(true);
  };

  const handleProductAdded = (novoProduto) => {
    console.log('Produto adicionado:', novoProduto);
    // Adicionar o novo produto à lista
    setProdutos(prevProdutos => [...prevProdutos, novoProduto]);
  };

  const handleProductAvailabilityToggle = async (productId, currentAvailability) => {
    const newAvailability = !currentAvailability;
    console.log(`Alterando disponibilidade do produto ${productId} para:`, newAvailability);
    
    try {
      const restaurantId = restaurant.id || restaurant.restaurante_id;
      const updatedProduct = await RestaurantService.updateProductAvailability(
        restaurantId, 
        productId, 
        newAvailability
      );
      
      if (updatedProduct) {
        // Atualizar o produto na lista local
        setProdutos(prevProdutos => 
          prevProdutos.map(produto => 
            produto.id === productId || produto.produto_id === productId
              ? { ...produto, disponivel: newAvailability }
              : produto
          )
        );
        console.log(`Disponibilidade do produto ${productId} atualizada com sucesso`);
      } else {
        console.error('Falha ao atualizar disponibilidade do produto');
      }
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade do produto:', error);
    }
  };

  const handleEditProduct = (productData) => {
    console.log('Editar produto:', productData);
    setProductToEdit(productData);
    setShowUpdateProductModal(true);
  };

  const handleProductUpdated = (produtoAtualizado) => {
    console.log('Produto atualizado:', produtoAtualizado);
    // Atualizar o produto na lista
    setProdutos(prevProdutos => 
      prevProdutos.map(produto => 
        produto.produto_id === produtoAtualizado.produto_id || produto.id === produtoAtualizado.produto_id
          ? produtoAtualizado
          : produto
      )
    );
  };

  const handleDeleteProduct = async (productId) => {
    console.log('Deletar produto:', productId);
    
    try {
      const restaurantId = restaurant.id || restaurant.restaurante_id;
      const success = await RestaurantService.deleteProduct(restaurantId, productId);
      
      if (success) {
        // Remover o produto da lista local
        setProdutos(prevProdutos => 
          prevProdutos.filter(produto => 
            produto.id !== productId && produto.produto_id !== productId
          )
        );
        console.log(`Produto ${productId} removido com sucesso`);
        Alert.alert('Sucesso', 'Produto removido com sucesso!');
      } else {
        console.error('Falha ao remover produto');
        Alert.alert('Erro', 'Falha ao remover produto. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      Alert.alert('Erro', 'Erro ao remover produto. Tente novamente.');
    }
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

    // Renderizar cada item de produto usando RestaurantProductItem
  const renderProductItem = ({ item }) => {
    // ✅ CORREÇÃO: Verificação de segurança para evitar renderizar itens null/undefined
    if (!item) {
      return null;
    }

    return (
      <RestaurantProductItem
        produto_id={item.produto_id || item.id}
        restaurante_id={item.restaurante_id || restaurant?.id || restaurant?.restaurante_id}
        nome={item.nome}
        descricao={item.descricao}
        valor={item.valor || item.preco}
        preco={item.preco}
        tempo_preparo={item.tempo_preparo}
        disponivel={item.disponivel}
        selos={item.selos}
        onAvailabilityToggle={handleProductAvailabilityToggle}
        onEditPress={handleEditProduct}
        onDeletePress={handleDeleteProduct}
      />
    );
  };

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
          {/* Header com apenas o botão de configuração */}
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            
            {/* <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleConfigurationPress}
            >
              <ConfigurationIcon width={24} height={24} />
            </TouchableOpacity> */}
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
                {restaurantDetails.numeroEstrelas.toFixed(1)} Estrelas
              </Text>
            </View>
            
            {/* Novo botão de status com design personalizado */}
            <View style={styles.statusContainer}>
              <TouchableOpacity
                style={[
                  styles.statusButtonLeft,
                  !restaurantDetails.isAberto && styles.statusButtonActiveLeft
                ]}
                onPress={handleStatusToggle}
                disabled={statusLoading}
              >
                <Text style={[
                  styles.statusButtonText,
                  !restaurantDetails.isAberto && styles.statusButtonTextActive
                ]}>
                  Fechado
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.statusButtonRight,
                  restaurantDetails.isAberto && styles.statusButtonActiveRight
                ]}
                onPress={handleStatusToggle}
                disabled={statusLoading}
              >
                <Text style={[
                  styles.statusButtonText,
                  restaurantDetails.isAberto && styles.statusButtonTextActive
                ]}>
                  Aberto
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
      
      {/* Botão Adicionar Produto */}
      <TouchableOpacity 
        style={styles.addProductButton}
        onPress={handleAddProductPress}
        activeOpacity={0.7}
      >
        <Text style={styles.addProductText}>Adicionar Produto</Text>
        <MaisIcon width={22} height={22} isPressed={true} />
      </TouchableOpacity>
    </View>
  );

  // Componente para lista vazia
  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Nenhum produto cadastrado ainda.
      </Text>
      <Text style={styles.emptySubText}>
        Clique em "Adicionar Produto" para começar a criar seu cardápio.
      </Text>
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
        keyExtractor={(item, index) => {
          // ✅ CORREÇÃO: Verificação de segurança para evitar erros com itens null/undefined
          if (!item) {
            return `empty-item-${index}`;
          }
          return (item.id || item.produto_id || `item-${index}`).toString();
        }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      
      {/* Modal de Adicionar Produto */}
      <AddProductModal
        visible={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        restaurantId={restaurant?.id || restaurant?.restaurante_id}
        onProductAdded={handleProductAdded}
      />

      {/* Modal de Editar Produto */}
      <UpdateProductModal
        visible={showUpdateProductModal}
        onClose={() => {
          setShowUpdateProductModal(false);
          setProductToEdit(null);
        }}
        restaurantId={restaurant?.id || restaurant?.restaurante_id}
        productData={productToEdit}
        onProductUpdated={handleProductUpdated}
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

  headerSpacer: {
    width: 40, // Mesmo tamanho do botão para centralizar
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
    padding: 12,
    alignItems: 'center',
    elevation: 5,
    gap: 8,
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

  // Novos estilos para o botão de status personalizado
  statusContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 4,
  },

  statusButtonLeft: {
    width: 75,
    height: 22,
    backgroundColor: '#EFE9F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },

  statusButtonRight: {
    width: 75,
    height: 22,
    backgroundColor: '#EFE9F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },

  statusButtonActiveLeft: {
    backgroundColor: '#E1D7E6',
    borderWidth: 1,
    borderColor: '#8B0BD5',
    borderRightWidth: 0,
  },

  statusButtonActiveRight: {
    backgroundColor: '#E1D7E6',
    borderWidth: 1,
    borderColor: '#8B0BD5',
    borderLeftWidth: 0,
  },

  statusButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#D9C0E7',
  },

  statusButtonTextActive: {
    color: '#8B0BD5',
  },

  // Estilos para o botão adicionar produto
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginTop: 80,
  },

  addProductText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#DD5F04',
    marginLeft: 8,
  },

  separator: {
    height: 8,
  },

  // Estilo para lista vazia
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },

  emptyText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    textAlign: 'center',
    marginBottom: 8,
  },

  emptySubText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    textAlign: 'center',
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