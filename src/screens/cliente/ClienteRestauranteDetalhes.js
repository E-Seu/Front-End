import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ImageBackground, FlatList, ActivityIndicator, Alert } from 'react-native';
import RetornarIcon from '../../assets/icons/retornarIcon';
import OpcoesIcon from '../../assets/icons/opcoesIcon';
import EstrelaIcon from '../../assets/icons/estrelaIcon';
import CarrinhoIcon from '../../assets/icons/carrinhoIcon';
import ProductItem from '../../components/ProductItem';
import CartModal from '../../components/CartModal';
import FilterModal from '../../components/FilterModal';
import RestaurantService from '../../services/RestaurantService';
import LoginService from '../../services/LoginService';
import PedidoService from '../../services/PedidoService';

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
  const [carrinho, setCarrinho] = useState({});
  const [temPedidoAtivo, setTemPedidoAtivo] = useState(false);
  const [pedidoAtivo, setPedidoAtivo] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    maxPrice: null,
    restrictions: []
  });
  // ✅ NOVO: Estado para dados atualizados do restaurante
  const [restaurantData, setRestaurantData] = useState(restaurant);

  // 🔍 LOG CRÍTICO: Verificar os dados do restaurante
  console.log('🏪 ClienteRestauranteDetalhes - Dados do restaurante:');
  console.log('📦 restaurant completo:', JSON.stringify(restaurant, null, 2));
  console.log('📦 restaurant.id:', restaurant?.id);
  console.log('📦 restaurant.restaurante_id:', restaurant?.restaurante_id);
  console.log('📦 restaurant.nome:', restaurant?.nome);

  // 🎯 SOLUÇÃO: Garantir que temos um ID válido
  const restaurantId = restaurant?.restaurante_id || restaurant?.id;

  console.log('📦 restaurantId final calculado:', restaurantId);
  console.log('📦 tipo do restaurantId:', typeof restaurantId);

  // Verificar se o restaurantId é válido
  useEffect(() => {
    if (!restaurantId) {
      console.error('❌ ERRO CRÍTICO: restaurantId é undefined/null');
      console.error('❌ restaurant object:', restaurant);
      
      // Mostrar alerta e voltar
      Alert.alert(
        'Erro',
        'Restaurante não identificado. Voltando para a tela anterior.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    }
  }, [restaurantId, restaurant, navigation]);

  // Carregar produtos do restaurante
  useEffect(() => {
    if (restaurantId) {
      loadRestaurantProducts();
    }
  }, [restaurantId]);

  // Verificar se cliente tem pedido ativo
  useEffect(() => {
    verificarPedidoAtivo();
  }, []);

  const verificarPedidoAtivo = async () => {
    try {
      const currentUser = await LoginService.getCurrentUser();
      if (currentUser.success) {
        const clienteId = currentUser.user.id || currentUser.user.usuario_id;
        const { temPedidoAtivo, pedidoAtivo } = await PedidoService.clienteTemPedidoAtivo(clienteId);
        
        setTemPedidoAtivo(temPedidoAtivo);
        setPedidoAtivo(pedidoAtivo);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar pedido ativo:', error);
    }
  };

  // ✅ NOVO: Função para carregar dados atualizados do restaurante
  const loadRestaurantData = async () => {
    try {
      console.log('🔄 Carregando dados atualizados do restaurante:', restaurantId);
      
      if (restaurantId) {
        const updatedRestaurant = await RestaurantService.getRestaurantById(restaurantId);
        if (updatedRestaurant) {
          console.log('📦 Dados atualizados do restaurante:', updatedRestaurant);
          setRestaurantData(updatedRestaurant);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do restaurante:', error);
      // Manter dados originais em caso de erro
      setRestaurantData(restaurant);
    }
  };

  const loadRestaurantProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando produtos do restaurante:', restaurantId);
      
      if (restaurantId) {
        const productsList = await RestaurantService.getProductsByRestaurant(restaurantId);
        console.log('📦 Produtos carregados:', productsList);
        setProdutos(productsList || []);
      } else {
        console.log('❌ Nenhum restaurantId válido encontrado');
        setProdutos([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MODIFICADO: Função para refresh atualizada
  const handleRefresh = async () => {
    setRefreshing(true);
    console.log('🔄 Iniciando refresh - carregando dados atualizados...');
    
    try {
      // Carregar dados atualizados do restaurante E produtos em paralelo
      await Promise.all([
        loadRestaurantData(),
        loadRestaurantProducts()
      ]);
      
      console.log('✅ Refresh concluído com sucesso');
    } catch (error) {
      console.error('❌ Erro durante refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Função para aplicar filtros
  const applyFilters = (products, filters) => {
    if (!products || products.length === 0) {
      return [];
    }

    return products.filter(product => {
      // Filtro por preço máximo
      if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
        const productPrice = parseFloat(product.valor || product.preco);
        if (productPrice > filters.maxPrice) {
          return false;
        }
      }

      // Filtro por restrições usando selos
      if (filters.restrictions && filters.restrictions.length > 0) {
        const productSelos = product.selos || {};
        
        // Verificar se o produto não atende às restrições desejadas
        const failsRestrictions = filters.restrictions.some(restriction => {
          // Mapear restrições para selos
          const seloMapping = {
            'Sem Lactose': 'sem_lactose',
            'Sem Glúten': 'sem_gluten',
            'Sem Amendoim': 'sem_amendoim',
            'Vegano': 'vegano'
          };
          
          const seloKey = seloMapping[restriction];
          if (seloKey) {
            // Se o usuário quer produtos sem lactose, mas o produto tem lactose (selo false)
            return productSelos[seloKey] !== true;
          }
          return false;
        });
        
        if (failsRestrictions) {
          return false;
        }
      }

      return true;
    });
  };

  // Produtos filtrados usando useMemo para otimização
  const filteredProducts = useMemo(() => {
    console.log('🔍 Aplicando filtros:', appliedFilters);
    console.log('📦 Produtos originais:', produtos.length);
    
    const filtered = applyFilters(produtos, appliedFilters);
    
    console.log('📦 Produtos filtrados:', filtered.length);
    return filtered;
  }, [produtos, appliedFilters]);

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
    const restaurantName = restaurantData?.nome || 'Restaurante Padrão';
    const hash = generateHash(restaurantName);
    const imageIndex = hash % restaurantImages.length;
    return restaurantImages[imageIndex];
  }, [restaurantData?.nome]);

  // ✅ MODIFICADO: Usar dados atualizados do restaurante
  const restaurantDetails = {
    nome: restaurantData?.nome || "Nome do Restaurante",
    info: restaurantData?.info || "Informações do restaurante",
    local: restaurantData?.local || restaurantData?.localizacao || "Local do restaurante",
    horarioAbertura: restaurantData?.horario_abertura || "08:00",
    horarioFechamento: restaurantData?.horario_fechamento || "22:00",
    numeroEstrelas: restaurantData?.numero_estrelas || 0,
    isAberto: restaurantData?.disponivel !== undefined ? restaurantData.disponivel : true,
    telefone: restaurantData?.telefone || "",
    tipo_restaurante: restaurantData?.tipo_restaurante || "",
    saldo: restaurantData?.saldo || 0
  };

  // ✅ NOVO: Log para debug do status
  useEffect(() => {
    console.log('📊 Status do restaurante atualizado:');
    console.log('📦 restaurantData.disponivel:', restaurantData?.disponivel);
    console.log('📦 restaurantDetails.isAberto:', restaurantDetails.isAberto);
  }, [restaurantData?.disponivel, restaurantDetails.isAberto]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleOpcoesPress = () => {
    console.log('🔄 Opções do restaurante pressionado');
    setShowFilterModal(true);
  };

  const handleApplyFilters = (filters) => {
    console.log('🔍 Filtros aplicados:', filters);
    setAppliedFilters(filters);
  };

  const handleQuantityChange = (quantidade, produtoInfo) => {
    console.log('🔄 Mudança de quantidade:');
    console.log('📦 Produto:', produtoInfo);
    console.log('📦 Nova quantidade:', quantidade);

    // ✅ Verificar se restaurante está disponível
    if (!restaurantDetails.isAberto) {
      Alert.alert('Restaurante Indisponível', 'Este restaurante está temporariamente indisponível.');
      return;
    }

    // Validar se o produto pertence ao restaurante atual
    if (produtoInfo?.restaurante_id && produtoInfo.restaurante_id !== restaurantId) {
      console.error('❌ Produto não pertence ao restaurante atual');
      Alert.alert('Erro', 'Este produto não pertence ao restaurante atual.');
      return;
    }

    const productId = produtoInfo?.produto_id || produtoInfo?.id;
    console.log('📦 Product ID final:', productId);
    
    // Atualizar o carrinho
    setCarrinho(prevCarrinho => {
      const newCarrinho = { ...prevCarrinho };
      
      if (quantidade > 0) {
        newCarrinho[productId] = quantidade;
      } else {
        delete newCarrinho[productId];
      }
      
      console.log('🛒 Carrinho atualizado:', newCarrinho);
      return newCarrinho;
    });
  };

  const handleCarrinhoPress = () => {
    console.log('🛒 Botão do carrinho pressionado');
    
    // ✅ Verificar se restaurante está disponível
    if (!restaurantDetails.isAberto) {
      Alert.alert('Restaurante Indisponível', 'Este restaurante está temporariamente indisponível.');
      return;
    }
    
    // Verificar se tem pedido ativo antes de abrir carrinho
    if (temPedidoAtivo) {
      const statusLabel = PedidoService.getStatusLabel(pedidoAtivo.status);
      Alert.alert(
        'Pedido Ativo',
        `Você já possui um pedido ativo (${statusLabel}). Aguarde a entrega para fazer um novo pedido.`,
        [
          { text: 'OK', style: 'cancel' }
        ]
      );
      return;
    }
    
    if (!restaurantId) {
      Alert.alert('Erro', 'ID do restaurante não encontrado. Não é possível abrir o carrinho.');
      return;
    }
    
    setShowCartModal(true);
  };

  const getTotalItemsInCart = () => {
    return Object.values(carrinho).reduce((total, quantidade) => total + quantidade, 0);
  };

  const hasItemsInCart = () => {
    return getTotalItemsInCart() > 0;
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
  const renderProductItem = ({ item }) => {
    console.log('🎨 Renderizando produto:', item);
    
    return (
      <ProductItem
        produto_id={item.produto_id || item.id}
        restaurante_id={item.restaurante_id || restaurantId}
        nome={item.nome}
        descricao={item.descricao}
        valor={item.valor || item.preco}
        tempo_preparo={item.tempo_preparo}
        disponivel={item.disponivel}
        restauranteDisponivel={restaurantDetails.isAberto} // ✅ Usar dados atualizados
        selos={item.selos}
        onQuantityChange={handleQuantityChange}
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
      
      {/* Indicador de filtros ativos */}
      {(appliedFilters.maxPrice || (appliedFilters.restrictions && appliedFilters.restrictions.length > 0)) && (
        <View style={styles.filterIndicatorContainer}>
          <Text style={styles.filterIndicatorText}>
            Filtros aplicados: {filteredProducts.length} de {produtos.length} produtos
          </Text>
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={() => setAppliedFilters({ maxPrice: null, restrictions: [] })}
          >
            <Text style={styles.clearFiltersText}>Limpar filtros</Text>
          </TouchableOpacity>
        </View>
      )}
      
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
  const EmptyComponent = () => {
    // Verificar se é por causa dos filtros ou se realmente não há produtos
    const isFilteredEmpty = produtos.length > 0 && filteredProducts.length === 0;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {isFilteredEmpty 
            ? "Nenhum produto encontrado com os filtros aplicados."
            : restaurantDetails.isAberto 
              ? "Este restaurante ainda não possui produtos cadastrados."
              : "Este restaurante está indisponível no momento."
          }
        </Text>
        
        {isFilteredEmpty && (
          <TouchableOpacity 
            style={styles.clearFiltersButtonEmpty}
            onPress={() => setAppliedFilters({ maxPrice: null, restrictions: [] })}
          >
            <Text style={styles.clearFiltersTextEmpty}>Limpar filtros</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Componente do botão de carrinho flutuante
  const FloatingCartButton = () => (
    <View style={styles.floatingCartContainer}>
      <TouchableOpacity 
        style={styles.cartButton} 
        onPress={handleCarrinhoPress}
        activeOpacity={0.8}
      >
        <CarrinhoIcon 
          width={40} 
          height={40} 
        />
        
        {hasItemsInCart() && (
          <Text style={styles.cartBadgeText}>
            {getTotalItemsInCart()}
          </Text>
        )}
      </TouchableOpacity>
      
      {hasItemsInCart() && (
        <View style={styles.verCarrinhoButton}>
          <Text style={styles.verCarrinhoText}>Ver carrinho</Text>
        </View>
      )}
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
        data={filteredProducts} // Usar produtos filtrados em vez de produtos originais
        renderItem={renderProductItem}
        keyExtractor={(item) => (item.id || item.produto_id).toString()}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        removeClippedSubviews={false}
      />
      
      {/* Botão de carrinho flutuante */}
      <FloatingCartButton />
      
      {/* Modal do carrinho */}
      <CartModal
        visible={showCartModal}
        onClose={() => setShowCartModal(false)}
        restaurantName={restaurantDetails.nome}
        restaurantId={restaurantId}
        cartItems={carrinho}
        produtos={produtos}
      />
      
      {/* Modal de Filtros */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
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

  statusText: {
    fontSize: 16,
    fontFamily: 'Nunito-Medium',
    textAlign: 'center',
  },

  debugInfo: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#999999',
    marginTop: 4,
  },

  // Estilos para indicador de filtros
  filterIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop: 70,
    marginBottom: -70,
  },

  filterIndicatorText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666666',
  },

  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#D9C0E7',
    borderRadius: 12,
  },

  clearFiltersText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#4E0777',
  },

  sectionTitle: {
    marginTop: 70,
    marginBottom: 5,
    paddingHorizontal: 20,
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
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },

  emptyText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    textAlign: 'center',
    marginBottom: 10,
  },

  clearFiltersButtonEmpty: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#D9C0E7',
    borderRadius: 20,
  },

  clearFiltersTextEmpty: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#4E0777',
  },

  // Estilos para o botão de carrinho flutuante
  floatingCartContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'flex-end',
  },

  verCarrinhoButton: {
    width: 117,
    height: 20,
    backgroundColor: '#D9C0E7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -15,
    marginRight: 38,
  },

  verCarrinhoText: {
    fontSize: 14,
    fontFamily: 'Nunito-ExtraBold',
    color: '#4E0777',
  },

  cartButton: {
    width: 53,
    height: 53,
    borderRadius: 26.5,
    backgroundColor: '#FFBE9D',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  cartBadgeText: {
    position: 'absolute',
    top: -1,
    right: -2,
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    color: '#F03800',
    textAlign: 'center',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
  },
});

export default ClienteRestauranteDetalhes;