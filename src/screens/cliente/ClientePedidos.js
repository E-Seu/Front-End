// ...existing code...
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CurrentOrder from '../../components/CurrentOrder';
import OldOrder from '../../components/OldOrder';
import PedidoService from '../../services/PedidoService';
import LoginService from '../../services/LoginService';
import RestaurantService from '../../services/RestaurantService';

const ClientePedidos = ({ navigation, route }) => {
  const [pedidoAtual, setPedidoAtual] = useState(null);
  const [historicoPedidos, setHistoricoPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [restaurantesCache, setRestaurantesCache] = useState(new Map());

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (clienteId) {
      loadPedidos();
    }
  }, [clienteId]);

  useEffect(() => {
    if (!clienteId) return;
    const interval = setInterval(() => {
      loadPedidos();
    }, 30000);
    return () => clearInterval(interval);
  }, [clienteId]);

  useFocusEffect(
    React.useCallback(() => {
      if (clienteId) {
        PedidoService?.limparCache();
        loadPedidos();
      }
    }, [clienteId])
  );

  useEffect(() => {
    if (route.params?.refresh && clienteId) {
      setTimeout(() => {
        loadPedidos();
      }, 500);
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh, clienteId]);

  const loadUserData = async () => {
    try {
      const currentUser = await LoginService.getCurrentUser();
      if (currentUser.success) {
        const user = currentUser.user;
        const userId = user.id || user.usuario_id;
        setUsuarioId(userId);
        if (user.papel === 'cliente') {
          setClienteId(userId);
        } else {
          setClienteId(userId);
        }
      }
    } catch (error) {}
  };

const loadPedidos = async () => {
  try {
    setLoading(true);
    if (!clienteId) return;
    if (!PedidoService.listarPedidosCliente) return;
    const pedidos = await PedidoService.listarPedidosCliente(clienteId);

    // Filtrar todos os pedidos ativos
    const pedidosAtivos = pedidos.filter(pedido => PedidoService.isPedidoAtivo(pedido.status));
    // Pega o mais recente como atual
    let pedidoAtivoMaisRecente = null;
    if (pedidosAtivos.length > 0) {
      pedidoAtivoMaisRecente = pedidosAtivos.reduce((a, b) =>
        new Date(a.data_hora) > new Date(b.data_hora) ? a : b
      );
    }

    // O histórico são todos os outros pedidos (inclusive ativos antigos)
    const pedidosHistorico = pedidos.filter(
      pedido => !PedidoService.isPedidoAtivo(pedido.status) ||
        (pedidoAtivoMaisRecente && pedido.pedido_id !== pedidoAtivoMaisRecente.pedido_id && PedidoService.isPedidoAtivo(pedido.status))
    );

    // Processar pedido atual
    if (pedidoAtivoMaisRecente) {
      const pedidoAtualFormatado = await formatarPedidoAtual(pedidoAtivoMaisRecente);
      setPedidoAtual(pedidoAtualFormatado);
    } else {
      setPedidoAtual(null);
    }

    // Processar histórico (ordenar por data mais recente primeiro)
    const historicoOrdenado = pedidosHistorico.sort((a, b) =>
      new Date(b.data_hora) - new Date(a.data_hora)
    );

    const historicoFormatado = await Promise.all(
      historicoOrdenado.map(pedido => formatarPedidoHistorico(pedido))
    );

    setHistoricoPedidos(historicoFormatado);

  } catch (error) {
    setPedidoAtual(null);
    setHistoricoPedidos([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const obterNomeRestaurante = async (restauranteId) => {
    try {
      if (restaurantesCache.has(restauranteId)) {
        return restaurantesCache.get(restauranteId);
      }
      let restaurante = null;
      if (RestaurantService.getRestaurant) {
        try {
          restaurante = await RestaurantService.getRestaurant(restauranteId);
        } catch {}
      }
      if (!restaurante && RestaurantService.getRestaurantById) {
        try {
          restaurante = await RestaurantService.getRestaurantById(restauranteId);
        } catch {}
      }
      if (!restaurante && RestaurantService.buscarRestaurante) {
        try {
          restaurante = await RestaurantService.buscarRestaurante(restauranteId);
        } catch {}
      }
      if (!restaurante && RestaurantService.listarRestaurantes) {
        try {
          const todosRestaurantes = await RestaurantService.listarRestaurantes();
          restaurante = todosRestaurantes.find(r => r.id === restauranteId || r.restaurante_id === restauranteId);
        } catch {}
      }
      let nome = `Restaurante ${restauranteId}`;
      if (restaurante) {
        nome = restaurante.nome || restaurante.name || `Restaurante ${restauranteId}`;
      }
      setRestaurantesCache(prev => new Map(prev).set(restauranteId, nome));
      return nome;
    } catch (error) {
      const nomeDefault = `Restaurante ${restauranteId}`;
      setRestaurantesCache(prev => new Map(prev).set(restauranteId, nomeDefault));
      return nomeDefault;
    }
  };

  const formatarPedidoAtual = async (pedido) => {
    const { data, hora } = PedidoService.formatarDataHora(pedido.data_hora);
    const nomeRestaurante = await obterNomeRestaurante(pedido.restaurante_id);
    return {
      id: pedido.pedido_id,
      horario: hora,
      nomeRestaurante,
      primeiroItem: pedido.observacao || `Pedido #${pedido.pedido_id}`,
      status: pedido.status,
      precoTotal: pedido.preco_total,
      localizacao: pedido.localizacao,
      observacao: pedido.observacao
    };
  };

  const formatarPedidoHistorico = async (pedido) => {
    const { data, hora } = PedidoService.formatarDataHora(pedido.data_hora);
    const nomeRestaurante = await obterNomeRestaurante(pedido.restaurante_id);
    return {
      id: pedido.pedido_id,
      dia: data,
      horario: hora,
      nomeRestaurante,
      primeiroItem: pedido.observacao || `Pedido #${pedido.pedido_id}`,
      status: pedido.status,
      precoTotal: pedido.preco_total
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    PedidoService.limparCache?.();
    setRestaurantesCache(new Map());
    await loadPedidos();
  };

  const handleVisualizarPedido = () => {
    if (pedidoAtual && navigation?.navigate) {
      navigation.navigate('PedidoDetalhes', { 
        pedidoId: pedidoAtual.id,
        pedido: pedidoAtual 
      });
    }
  };

  const handlePecaNovamanete = async (pedido) => {
    try {
      const pedidoCompleto = await PedidoService.buscarPedido(pedido.id);
      if (pedidoCompleto && navigation?.navigate) {
        navigation.navigate('ClienteRestauranteDetalhes', {
          restaurantId: pedidoCompleto.restaurante_id,
          repetirPedido: true,
          pedidoOriginal: pedidoCompleto
        });
      }
    } catch (error) {}
  };

  const temPedidoAtual = pedidoAtual && PedidoService.isPedidoAtivo?.(pedidoAtual.status);

  const renderOldOrderItem = ({ item }) => (
    <OldOrder
      dia={item.dia}
      horario={item.horario}
      nomeRestaurante={item.nomeRestaurante}
      primeiroItem={item.primeiroItem}
      precoTotal={item.precoTotal}
      status={item.status}
      onPecaNovamantePress={() => handlePecaNovamanete(item)}
    />
  );

  const LoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#8B0BD5" />
      <Text style={styles.loadingText}>Carregando pedidos...</Text>
    </View>
  );

  const EmptyStateComponent = ({ title, subtitle }) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
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
        <Text style={styles.sectionTitle}>Pedido atual</Text>        
        <View style={styles.separator} />
        {temPedidoAtual ? (
          <CurrentOrder
            horario={pedidoAtual.horario}
            nomeRestaurante={pedidoAtual.nomeRestaurante}
            primeiroItem={pedidoAtual.primeiroItem}
            precoTotal={pedidoAtual.precoTotal}
            status={pedidoAtual.status}
            onVisualizarPress={handleVisualizarPedido}
          />
        ) : (
          <EmptyStateComponent 
            title="Você não possui pedidos em andamento"
            subtitle="Faça um pedido para acompanhar aqui!"
          />
        )}
        <View style={styles.separatorHistorico} />
        <Text style={styles.sectionTitle}>Histórico</Text>
        {historicoPedidos.length > 0 ? (
          <View style={styles.historicoContainer}>
            <FlatList
              data={historicoPedidos}
              renderItem={renderOldOrderItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <EmptyStateComponent 
            title="Nenhum pedido encontrado no histórico"
            subtitle="Seus pedidos anteriores aparecerão aqui"
          />
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
  separatorHistorico: {
    height: 1,
    backgroundColor: '#D9C0E7',
    marginHorizontal: 20,
    marginTop: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    marginTop: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    color: '#F03800',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#888888',
    textAlign: 'center',
  },
  historicoContainer: {
    marginBottom: 20,
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

export default ClientePedidos;