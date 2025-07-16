import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import DeliveredOrder from '../../components/DeliveredOrder';
import { useAuth } from '../../context/AuthContext';
import EntregadorService from '../../services/EntregadorService';

const EntregadorEntregas = () => {
  const { user } = useAuth();
  const entregadorId = user?.entregador_id || user?.id; // ajuste conforme estrutura do user

  const [pedidosEntreguesIds, setPedidosEntreguesIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidosEntregues = async () => {
      setLoading(true);
      try {
        // Busca todos os pedidos entregues do entregador
        const pedidos = await EntregadorService.visualizarPedidosEntregues(entregadorId);
        // Extrai os IDs dos pedidos entregues
        const ids = (pedidos || []).map(p => p.pedido_id);
        setPedidosEntreguesIds(ids);
      } catch (error) {
        setPedidosEntreguesIds([]);
      }
      setLoading(false);
    };
    if (entregadorId) {
      fetchPedidosEntregues();
    }
  }, [entregadorId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ENTREGAS</Text>
      </View>
      <Text style={styles.sectionTitle}>Pedidos entregues</Text>
      <View style={styles.separatorHistorico} />
      {entregadorId ? (
        loading ? (
          <ActivityIndicator size="large" color="#8B0BD5" style={{ marginTop: 32 }} />
        ) : pedidosEntreguesIds.length > 0 ? (
          <DeliveredOrder entregadorId={entregadorId} pedidosEntreguesIds={pedidosEntreguesIds} />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhum pedido entregue encontrado.</Text>
          </View>
        )
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Você precisa estar logado como entregador para ver suas entregas.</Text>
        </View>
      )}
      <View style={styles.bottomSpacing} />
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
  bottomSpacing: {
    height: 50,
  },
});

export default EntregadorEntregas;