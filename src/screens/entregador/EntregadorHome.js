import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import NovaEntregaButton from '../../components/NovaEntregaButton';
import EntregadorService from '../../services/EntregadorService';
import LoginService from '../../services/LoginService';
import { useAuth } from '../../context/AuthContext';

const EntregadorHome = ({ route }) => {
  const { user } = useAuth();
  const [disponivel, setDisponivel] = useState(false);
  const [loadingDisponivel, setLoadingDisponivel] = useState(false);
  const [pedidoPronto, setPedidoPronto] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
  const [entregadorData, setEntregadorData] = useState(null);
  const [saldoAtual, setSaldoAtual] = useState(0);

  // ✅ Função para recarregar saldo
  const recarregarSaldo = async () => {
    try {
      if (usuarioId) {
        const saldoData = await EntregadorService.visualizarSaldoEntregador(usuarioId);
        if (saldoData) {
          setSaldoAtual(saldoData.saldo || 0);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao recarregar saldo:', error);
    }
  };

  // ✅ Recarregar saldo quando dados são carregados
  useEffect(() => {
    if (usuarioId) {
      fetchStatus();
      recarregarSaldo();
    }
  }, [usuarioId]);

  // ✅ Carregar dados do entregador
  useEffect(() => {
    loadEntregadorData();
  }, []);

  // ✅ Carregar status quando usuarioId estiver disponível
  useEffect(() => {
    if (usuarioId) {
      fetchStatus();
    }
  }, [usuarioId]);

  const loadEntregadorData = async () => {
    try {
      // Primeiro tentar do route.params
      let userId = route?.params?.entregadorId;
      
      // Se não tiver, tentar do contexto de autenticação
      if (!userId) {
        userId = user?.id || user?.usuario_id;
      }
      
      // Se ainda não tiver, tentar do LoginService
      if (!userId) {
        const currentUser = await LoginService.getCurrentUser();
        if (currentUser.success) {
          userId = currentUser.user.id || currentUser.user.usuario_id;
        }
      }
      
      if (userId) {
        setUsuarioId(userId);
        console.log('✅ Usuario ID definido na Home:', userId);
        
        // ✅ Buscar dados completos do entregador
        const entregador = await EntregadorService.getEntregadorByUsuarioId(userId);
        if (entregador) {
          setEntregadorData(entregador);
          console.log('✅ Dados do entregador carregados:', entregador);
        }
      } else {
        console.error('❌ Não foi possível obter ID do usuário');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do entregador:', error);
    }
  };

  const fetchStatus = async () => {
    try {
      // ✅ Buscar dados do entregador usando usuario_id
      const entregador = await EntregadorService.getEntregador(usuarioId);
      if (entregador) {
        setDisponivel(!!entregador.disponivel);
        setEntregadorData(entregador);
        console.log('✅ Status do entregador atualizado:', entregador);
      }

      // Buscar pedidos disponíveis
      const pedidos = await EntregadorService.buscarPedidosDisponiveis();
      const pedido = pedidos.find(p => p.status === 'pronto');
      setPedidoPronto(pedido || null);
    } catch (error) {
      console.error('❌ Erro ao buscar status:', error);
    }
  };

  const handleToggleDisponivel = async () => {
    if (!usuarioId) {
      console.error('❌ ID do usuário não disponível');
      return;
    }

    setLoadingDisponivel(true);
    const novoDisponivel = !disponivel;
    
    console.log(`🔄 Usuário ${usuarioId} alterando disponibilidade para ${novoDisponivel}...`);
    
    // ✅ Usar usuario_id para atualizar disponibilidade
    const resultado = await EntregadorService.atualizarDisponibilidade(usuarioId, novoDisponivel);
    
    if (resultado) {
      setDisponivel(novoDisponivel);
      console.log('✅ Disponibilidade atualizada com sucesso');
    } else {
      console.error('❌ Falha ao atualizar disponibilidade');
    }
    
    setLoadingDisponivel(false);
  };

  // ✅ Não renderizar se não tiver usuarioId
  if (!usuarioId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0BD5" />
          <Text style={styles.loadingText}>Carregando dados do entregador...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.disponivelQuadro}>
        <TouchableOpacity
          style={[
            styles.disponivelBtn,
            {
              backgroundColor: disponivel ? '#FFF5EC' : '#F2F2F2',
              borderColor: disponivel ? '#FF9900' : '#CCCCCC',
              shadowColor: disponivel ? '#FF9900' : '#888',
              opacity: loadingDisponivel ? 0.6 : 1,
            }
          ]}
          onPress={handleToggleDisponivel}
          activeOpacity={0.85}
          disabled={loadingDisponivel}
        >
          {loadingDisponivel ? (
            <ActivityIndicator color={disponivel ? '#FF9900' : '#888888'} size="small" />
          ) : (
            <Text style={[
              styles.disponivelText,
              { color: disponivel ? '#FF9900' : '#888888' }
            ]}>
              {disponivel ? 'Disponível' : 'Indisponível'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.mapaContainer}>
        <MapView 
          style={styles.mapa}
          initialRegion={{
            latitude: -3.7492,
            longitude: -38.5747,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker
            coordinate={{ latitude: -3.7492, longitude: -38.5747 }}
            title="UECE"
            description="Aqui é a UECE"
          />
        </MapView>
        {/* ✅ Botão Nova Entrega aparece se houver pedido pronto */}
        {pedidoPronto && <NovaEntregaButton />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  disponivelQuadro: {
    marginTop: 0,
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderColor: '#EEE',
    borderWidth: 1,
    borderTopWidth: 0,
    alignItems: 'center',
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 2,
  },
  disponivelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  disponivelText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    letterSpacing: 0.2,
  },
  mapaContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  mapa: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
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
});

export default EntregadorHome;