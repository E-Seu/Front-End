import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, FlatList, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DeliveredOrder from '../../components/DeliveredOrder';
import { useAuth } from '../../context/AuthContext';
import EntregadorService from '../../services/EntregadorService';
import RestaurantService from '../../services/RestaurantService';
import LoginService from '../../services/LoginService';

const EntregadorEntregas = () => {
  const { user } = useAuth();
  const [pedidosEntregues, setPedidosEntregues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [entregadorId, setEntregadorId] = useState(null);
  const [restaurantesCache, setRestaurantesCache] = useState(new Map());

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (entregadorId) {
      loadPedidosEntregues();
    }
  }, [entregadorId]);

  // ✅ Recarregar quando a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      if (entregadorId) {
        loadPedidosEntregues();
      }
    }, [entregadorId])
  );

  const loadUserData = async () => {
    try {
      console.log('🔄 Carregando dados do usuário...');
      
      // Primeiro tentar do contexto de autenticação
      let userId = user?.entregador_id || user?.id;
      
      // Se não tiver, tentar do LoginService
      if (!userId) {
        const currentUser = await LoginService.getCurrentUser();
        if (currentUser.success) {
          userId = currentUser.user.id || currentUser.user.usuario_id;
        }
      }
      
      if (userId) {
        setEntregadorId(userId);
        console.log('✅ Entregador ID definido:', userId);
      } else {
        console.error('❌ Não foi possível obter ID do entregador');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
    }
  };

  const loadPedidosEntregues = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Buscando pedidos entregues para entregador ${entregadorId}...`);
      
      if (!entregadorId) {
        console.error('❌ ID do entregador não definido');
        return;
      }

      const pedidos = await EntregadorService.visualizarPedidosEntregues(entregadorId);
      console.log('📦 Pedidos entregues recebidos:', pedidos);
      
      if (Array.isArray(pedidos)) {
        // Processar pedidos para o formato esperado
        const pedidosFormatados = await Promise.all(
          pedidos.map(async (pedido) => {
            console.log('🔄 Processando pedido:', pedido);
            
            // Buscar nome do restaurante
            const nomeRestaurante = await obterNomeRestaurante(pedido.restaurante_id);
            
            // Formatar data
            const { dia, horario } = formatarData(pedido.data_hora || pedido.horario_entrega);
            
            // Obter primeiro item
            const primeiroItem = getPrimeiroItem(pedido);
            
            return {
              ...pedido,
              nomeRestaurante,
              dia,
              horario,
              primeiroItem
            };
          })
        );
        
        // Ordenar por data mais recente primeiro
        const pedidosOrdenados = pedidosFormatados.sort((a, b) => 
          new Date(b.data_hora || b.horario_entrega) - new Date(a.data_hora || a.horario_entrega)
        );
        
        setPedidosEntregues(pedidosOrdenados);
        console.log('✅ Pedidos entregues processados:', pedidosOrdenados.length);
      } else {
        console.warn('⚠️ Dados recebidos não são um array:', pedidos);
        setPedidosEntregues([]);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos entregues:', error);
      setPedidosEntregues([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const obterNomeRestaurante = async (restauranteId) => {
    try {
      // Verificar cache primeiro
      if (restaurantesCache.has(restauranteId)) {
        return restaurantesCache.get(restauranteId);
      }

      console.log(`🔄 Buscando nome do restaurante ${restauranteId}...`);
      
      // Tentar buscar via RestaurantService
      let restaurante = null;
      
      try {
        restaurante = await RestaurantService.getRestaurantById(restauranteId);
      } catch (error) {
        console.log('⚠️ Erro ao buscar restaurante por ID:', error.message);
      }
      
      // Fallback: buscar todos os restaurantes
      if (!restaurante) {
        try {
          const todosRestaurantes = await RestaurantService.getAllRestaurants();
          restaurante = todosRestaurantes.find(r => 
            r.id === restauranteId || r.restaurante_id === restauranteId
          );
        } catch (error) {
          console.log('⚠️ Erro ao buscar todos os restaurantes:', error.message);
        }
      }
      
      const nome = restaurante?.nome || `Restaurante ${restauranteId}`;
      
      // Salvar no cache
      setRestaurantesCache(prev => new Map(prev).set(restauranteId, nome));
      
      console.log(`✅ Nome do restaurante ${restauranteId}: ${nome}`);
      return nome;
    } catch (error) {
      console.error(`❌ Erro ao obter nome do restaurante ${restauranteId}:`, error);
      const nomeDefault = `Restaurante ${restauranteId}`;
      setRestaurantesCache(prev => new Map(prev).set(restauranteId, nomeDefault));
      return nomeDefault;
    }
  };

  const formatarData = (dataHora) => {
    if (!dataHora) return { dia: 'dia exemplo', horario: 'horario exemplo' };
    
    try {
      const data = new Date(dataHora);
      
      // Verificar se a data é válida
      if (isNaN(data.getTime())) {
        console.warn('⚠️ Data inválida:', dataHora);
        return { dia: 'dia exemplo', horario: 'horario exemplo' };
      }
      
      const dia = data.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      const horario = data.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return { dia, horario };
    } catch (error) {
      console.error('❌ Erro ao formatar data:', error);
      return { dia: 'dia exemplo', horario: 'horario exemplo' };
    }
  };

  const getPrimeiroItem = (pedido) => {
    try {
      // Tentar diferentes estruturas de dados
      if (pedido?.pedido_produtos && Array.isArray(pedido.pedido_produtos) && pedido.pedido_produtos.length > 0) {
        const produto = pedido.pedido_produtos[0]?.produto;
        if (produto?.nome) {
          return produto.nome;
        }
      }
      
      // Fallback para observacao
      if (pedido?.observacao) {
        return pedido.observacao;
      }
      
      // Fallback para ID do pedido
      return `Pedido #${pedido.pedido_id}`;
    } catch (error) {
      console.error('❌ Erro ao obter primeiro item:', error);
      return 'Item';
    }
  };

  const handleMaisInformacoes = (pedido) => {
    console.log('🔄 Mais informações do pedido:', pedido);
    // TODO: Implementar modal de mais informações
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setRestaurantesCache(new Map()); // Limpar cache de restaurantes
    await loadPedidosEntregues();
  };

  const renderPedidoEntregue = ({ item }) => {
    return (
      <DeliveredOrder
        dia={item.dia}
        horario={item.horario}
        nomeRestaurante={item.nomeRestaurante}
        primeiroItem={item.primeiroItem}
        pedidoOriginal={item}
        onMaisInformacoesPress={handleMaisInformacoes}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ENTREGAS</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0BD5" />
          <Text style={styles.loadingText}>Carregando entregas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ENTREGAS</Text>
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
        <Text style={styles.sectionTitle}>Pedidos entregues</Text>
        <View style={styles.separatorHistorico} />
        
        {entregadorId ? (
          pedidosEntregues.length > 0 ? (
            <FlatList
              data={pedidosEntregues}
              keyExtractor={(item) => String(item.pedido_id)}
              renderItem={renderPedidoEntregue}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Nenhuma entrega encontrada</Text>
              <Text style={styles.emptySubtitle}>Você ainda não realizou nenhuma entrega</Text>
            </View>
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Acesso negado</Text>
            <Text style={styles.emptySubtitle}>Você precisa estar logado como entregador</Text>
          </View>
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
  
  separatorHistorico: {
    height: 1,
    backgroundColor: '#D9C0E7',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  
  emptyContainer: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
    textAlign: 'center',
    marginBottom: 2,
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
  
  bottomSpacing: {
    height: 50,
  },
});

export default EntregadorEntregas;