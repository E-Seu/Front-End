import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';

const EntregadorEntregas = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [historicoPedidos, setHistoricoPedidos] = useState([]);

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    setLoading(true);
    // Aqui você vai buscar o histórico de entregas do entregador
    // Exemplo mock:
    setTimeout(() => {
      setHistoricoPedidos([
        // Adicione objetos de histórico aqui
      ]);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await carregarPedidos();
  };

  const renderPedidoHistorico = ({ item }) => (
    // Substitua por seu componente de histórico
    <View style={styles.pedidoBox}>
      <Text>Histórico #{item.id}</Text>
    </View>
  );

  const LoadingComponent = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#8B0BD5" />
      <Text style={styles.loadingText}>Carregando entregas...</Text>
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
          <Text style={styles.headerTitle}>ENTREGAS</Text>
        </View>
        <LoadingComponent />
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
        <Text style={styles.sectionTitle}>Histórico de entregas</Text>
        <View style={styles.separatorHistorico} />
        {historicoPedidos.length > 0 ? (
          <FlatList
            data={historicoPedidos}
            renderItem={renderPedidoHistorico}
            keyExtractor={(item) => item.id?.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyStateComponent
            title="Nenhuma entrega encontrada no histórico"
            subtitle="Suas entregas anteriores aparecerão aqui"
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
  pedidoBox: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 20,
    elevation: 1,
  },
});

export default EntregadorEntregas;