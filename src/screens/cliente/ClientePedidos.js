import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CurrentOrder from '../../components/CurrentOrder';
import OldOrder from '../../components/OldOrder';
import PedidoService from '../../services/PedidoService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClientePedidos = ({ navigation, route }) => {
  const [pedidoAtual, setPedidoAtual] = useState(null);
  const [historicoPedidos, setHistoricoPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  // Carregar dados do usuário
  useEffect(() => {
    loadUserData();
  }, []);

  // Carregar pedidos quando usuário estiver disponível
  useEffect(() => {
    if (usuarioId) {
      loadPedidos();
    }
  }, [usuarioId]);

  // Atualizar quando a tela receber foco (usuário navegar para ela)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Tela de pedidos recebeu foco, atualizando...');
      if (usuarioId) {
        loadPedidos();
      }
    }, [usuarioId])
  );

  // Verificar se foi passado parâmetro para forçar atualização
  useEffect(() => {
    // ✅ Adicionar verificação de segurança para route e params
    if (route?.params?.refresh && usuarioId) {
      console.log('🔄 Atualização forçada por parâmetro');
      loadPedidos();
      
      // Limpar o parâmetro para não recarregar sempre
      if (navigation?.setParams) {
        navigation.setParams({ refresh: false });
      }
    }
  }, [route?.params?.refresh, usuarioId, navigation]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user.id || user.usuario_id;
        console.log('👤 Usuário carregado:', userId);
        setUsuarioId(userId);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
    }
  };

  const loadPedidos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando pedidos para usuário:', usuarioId);
      
      if (usuarioId) {
        // Carregar histórico de pedidos
        const historico = await PedidoService.historicoPedidos(usuarioId);
        console.log('📦 Histórico carregado:', historico.length, 'pedidos');
        
        // Separar pedido atual dos pedidos históricos
        const pedidoAtivo = historico.find(pedido => 
          PedidoService.isPedidoAtivo(pedido.status)
        );
        
        const pedidosConcluidos = historico.filter(pedido => 
          !PedidoService.isPedidoAtivo(pedido.status)
        );
        
        console.log('📊 Pedidos ativos:', pedidoAtivo ? 1 : 0);
        console.log('📊 Pedidos concluídos:', pedidosConcluidos.length);
        
        // Formatar dados para exibição
        if (pedidoAtivo) {
          const { data, hora } = PedidoService.formatarDataHora(pedidoAtivo.data_hora);
          setPedidoAtual({
            id: pedidoAtivo.pedido_id,
            horario: hora,
            nomeRestaurante: `Restaurante ${pedidoAtivo.restaurante_id}`,
            primeiroItem: `Pedido #${pedidoAtivo.pedido_id}`,
            status: pedidoAtivo.status,
            precoTotal: pedidoAtivo.preco_total,
            localizacao: pedidoAtivo.localizacao,
            observacao: pedidoAtivo.observacao
          });
          console.log('✅ Pedido atual definido:', pedidoAtivo.pedido_id);
        } else {
          setPedidoAtual(null);
          console.log('❌ Nenhum pedido ativo encontrado');
        }
        
        // Formatar histórico
        const historicoFormatado = pedidosConcluidos.map(pedido => {
          const { data, hora } = PedidoService.formatarDataHora(pedido.data_hora);
          return {
            id: pedido.pedido_id,
            dia: data,
            horario: hora,
            nomeRestaurante: `Restaurante ${pedido.restaurante_id}`,
            primeiroItem: `Pedido #${pedido.pedido_id}`,
            status: pedido.status,
            precoTotal: pedido.preco_total
          };
        });
        
        setHistoricoPedidos(historicoFormatado);
        console.log('✅ Histórico formatado:', historicoFormatado.length, 'pedidos');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
      setPedidoAtual(null);
      setHistoricoPedidos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Pull to refresh');
    setRefreshing(true);
    await loadPedidos();
  };

  const handleVisualizarPedido = () => {
    console.log('📱 Visualizar pedido:', pedidoAtual?.id);
    // Aqui você pode navegar para tela de detalhes do pedido
    // if (navigation?.navigate) {
    //   navigation.navigate('PedidoDetalhes', { pedidoId: pedidoAtual.id });
    // }
  };

  const handlePecaNovamanete = (pedido) => {
    console.log('🔄 Peça novamente pedido:', pedido.id);
    // Aqui você pode implementar a lógica para repetir o pedido
    // Pode navegar para o restaurante ou adicionar itens ao carrinho
  };

  // Verificar se existe pedido atual
  const temPedidoAtual = pedidoAtual && PedidoService.isPedidoAtivo(pedidoAtual.status);

  const renderOldOrderItem = ({ item }) => (
    <OldOrder
      dia={item.dia}
      horario={item.horario}
      nomeRestaurante={item.nomeRestaurante}
      primeiroItem={item.primeiroItem}
      onPecaNovamantePress={() => handlePecaNovamanete(item)}
    />
  );

  // Componente de loading
  const LoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#8B0BD5" />
      <Text style={styles.loadingText}>Carregando pedidos...</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PEDIDOS</Text>
      </View>

      {/* Conteúdo */}
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
        {/* Seção de Pedido Atual */}
        <Text style={styles.sectionTitle}>Pedido atual</Text>        
        <View style={styles.separator} />
        
        {/* Pedido Atual */}
        {temPedidoAtual ? (
          <CurrentOrder
            horario={pedidoAtual.horario}
            nomeRestaurante={pedidoAtual.nomeRestaurante}
            primeiroItem={pedidoAtual.primeiroItem}
            onVisualizarPress={handleVisualizarPedido}
          />
        ) : (
          <View style={styles.noPedidoContainer}>
            <Text style={styles.noPedidoText}>
              Você não possui pedidos em andamento
            </Text>
            <Text style={styles.noPedidoSubText}>
              Faça um pedido para acompanhar aqui!
            </Text>
          </View>
        )}
        
        <View style={styles.separatorHistorico} />
        
        {/* Seção de Histórico */}
        <Text style={styles.sectionTitle}>Histórico</Text>
        
        {/* Lista de Pedidos Antigos */}
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
          <View style={styles.noHistoricoContainer}>
            <Text style={styles.noHistoricoText}>
              Nenhum pedido encontrado no histórico
            </Text>
          </View>
        )}

        {/* Espaçamento no final */}
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

  noPedidoContainer: {
    padding: 40,
    alignItems: 'center',
    marginTop: 50,
  },

  noPedidoText: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    color: '#F03800',
    textAlign: 'center',
    marginBottom: 10,
  },

  noPedidoSubText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#888888',
    textAlign: 'center',
  },

  historicoContainer: {
    marginBottom: 20,
  },

  noHistoricoContainer: {
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },

  noHistoricoText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    textAlign: 'center',
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

  bottomSpacing: {
    height: 50,
  },
});

export default ClientePedidos;