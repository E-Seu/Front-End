import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RestaurantOrder from '../../components/RestaurantOrder';
import PedidoService from '../../services/PedidoService';
import { useAuth } from '../../context/AuthContext';
import RestaurantService from '../../services/RestaurantService';
import ClienteService from '../../services/ClienteService';

const RestaurantePedidos = ({ navigation, route }) => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [clientesCache, setClientesCache] = useState(new Map());

  useEffect(() => {
    loadRestaurantData();
  }, []);

  useEffect(() => {
    if (restaurantId) {
      loadPedidos();
    }
  }, [restaurantId]);

  // Atualizar pedidos periodicamente
  useEffect(() => {
    if (!restaurantId) return;
    
    const interval = setInterval(() => {
      loadPedidos();
    }, 30000); // A cada 30 segundos
    
    return () => clearInterval(interval);
  }, [restaurantId]);

  // Recarregar ao focar na tela
  useFocusEffect(
    React.useCallback(() => {
      if (restaurantId) {
        loadPedidos();
      }
    }, [restaurantId])
  );

  // Recarregar se vier parâmetro de refresh
  useEffect(() => {
    if (route.params?.refresh && restaurantId) {
      setTimeout(() => {
        loadPedidos();
      }, 500);
      // Limpar o parâmetro para evitar recarregamentos desnecessários
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh, restaurantId]);

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
          setRestaurantId(restaurantData.id || restaurantData.restaurante_id);
        } else {
          console.log('Nenhum restaurante encontrado para o usuário');
          setRestaurant(null);
          setRestaurantId(null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do restaurante:', error);
      setRestaurant(null);
      setRestaurantId(null);
    } finally {
      setLoading(false);
    }
  };

  const loadPedidos = async () => {
    try {
      if (!restaurantId) return;
      
      setRefreshing(true);
      console.log(`Carregando pedidos do restaurante ${restaurantId}...`);
      
      const pedidosDoRestaurante = await PedidoService.listarPedidosRestaurante(restaurantId);
      
      // Formatar pedidos para exibição
      const pedidosFormatados = await Promise.all(
        pedidosDoRestaurante.map(pedido => formatarPedido(pedido))
      );
      
      console.log(`Pedidos do restaurante ${restaurantId}:`, pedidosFormatados);
      setPedidos(pedidosFormatados);
      
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setPedidos([]);
    } finally {
      setRefreshing(false);
    }
  };

  const obterNomeCliente = async (clienteId) => {
    try {
      // Verificar cache primeiro
      if (clientesCache.has(clienteId)) {
        return clientesCache.get(clienteId);
      }
      
      console.log(`🔄 Buscando nome do cliente ${clienteId}...`);
      
      const clienteCompleto = await ClienteService.getCliente(clienteId);
      
      let nomeCliente = `Cliente ${clienteId}`;
      
      if (clienteCompleto && clienteCompleto.nomeCompleto) {
        nomeCliente = clienteCompleto.nomeCompleto;
        console.log(`✅ Nome do cliente ${clienteId} encontrado: ${nomeCliente}`);
      } else {
        console.log(`⚠️ Nome do cliente ${clienteId} não encontrado, usando fallback`);
      }
      
      // Adicionar ao cache
      setClientesCache(prev => new Map(prev).set(clienteId, nomeCliente));
      
      return nomeCliente;
    } catch (error) {
      console.error(`❌ Erro ao obter nome do cliente ${clienteId}:`, error);
      
      const nomeDefault = `Cliente ${clienteId}`;
      setClientesCache(prev => new Map(prev).set(clienteId, nomeDefault));
      
      return nomeDefault;
    }
  };

  const formatarPedido = async (pedido) => {
    const { data, hora } = PedidoService.formatarDataHora(pedido.data_hora);
    const nomeCliente = await obterNomeCliente(pedido.cliente_id);
    
    return {
      id: pedido.pedido_id,
      pedidoId: pedido.pedido_id,
      horario: hora,
      nomeCliente,
      primeiroItem: pedido.observacao || `Pedido #${pedido.pedido_id}`,
      status: pedido.status,
      precoTotal: pedido.preco_total,
      localizacao: pedido.localizacao,
      observacao: pedido.observacao,
      pedido: pedido // Passar o pedido completo
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Limpar cache
    setClientesCache(new Map());
    await loadPedidos();
  };

  // Callback para quando o status de um pedido for atualizado
  const handleStatusUpdated = (pedidoId, novoStatus) => {
    console.log(`Status do pedido ${pedidoId} atualizado para ${novoStatus}`);
    
    // Atualizar o pedido na lista local
    setPedidos(prevPedidos => 
      prevPedidos.map(pedido => 
        pedido.pedidoId === pedidoId || pedido.id === pedidoId
          ? { ...pedido, status: novoStatus }
          : pedido
      )
    );
    
    // Opcionalmente, recarregar todos os pedidos após um pequeno delay
    setTimeout(() => {
      loadPedidos();
    }, 1000);
  };

  const handleVisualizarPedido = (pedido) => {
    console.log('Visualizar pedido do restaurante:', pedido);
  };

  const renderPedidoItem = ({ item }) => (
    <RestaurantOrder
      horario={item.horario}
      nomeCliente={item.nomeCliente}
      primeiroItem={item.primeiroItem}
      status={item.status}
      precoTotal={item.precoTotal}
      pedidoId={item.pedidoId}
      pedido={item.pedido}
      onVisualizarPress={() => handleVisualizarPedido(item)}
      onStatusUpdated={handleStatusUpdated} // ✅ Adicionar callback
    />
  );

  const LoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#8B0BD5" />
      <Text style={styles.loadingText}>Carregando pedidos...</Text>
    </View>
  );

  const EmptyStateComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
      <Text style={styles.emptySubtitle}>
        Os pedidos do seu restaurante aparecerão aqui
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PEDIDOS</Text>
        </View>
        <LoadingComponent />
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PEDIDOS</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Nenhum restaurante encontrado para este usuário
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PEDIDOS</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B0BD5']}
            tintColor="#8B0BD5"
          />
        }
      >
        <Text style={styles.sectionTitle}>Fila de Pedidos</Text>        
        <View style={styles.separator} />
        
        {pedidos.length > 0 ? (
          <FlatList
            data={pedidos}
            renderItem={renderPedidoItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyStateComponent />
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    position: 'relative',
  },
  
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    textAlign: 'center',
  },
  
  content: {
    flex: 1,
  },
  
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  
  separator: {
    height: 1,
    backgroundColor: '#D9C0E7',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  
  emptyContainer: {
    padding: 15,
    alignItems: 'center',
    marginTop: 50,
  },
  
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Medium',
    color: '#888888',
    textAlign: 'center',
  },
  
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
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  errorText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    textAlign: 'center',
  },
  
  bottomSpacing: {
    height: 50,
  },
});

export default RestaurantePedidos;