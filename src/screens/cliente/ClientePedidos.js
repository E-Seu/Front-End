import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import CurrentOrder from '../../components/CurrentOrder';
import OldOrder from '../../components/OldOrder';

const ClientePedidos = ({ navigation }) => {
  const [pedidoAtual, setPedidoAtual] = useState({
    horario: "12:30",
    nomeRestaurante: "Restaurante Sabor Caseiro",
    primeiroItem: "2x Feijoada",
    status: "em preparo"
  });

  // Mock data para histórico de pedidos
  const [historicoPedidos, setHistoricoPedidos] = useState([
    {
      id: 1,
      dia: "15/07/2025",
      horario: "19:45",
      nomeRestaurante: "Pizzaria Bella Massa",
      primeiroItem: "1x Pizza Margherita",
      status: "concluido"
    },
    {
      id: 2,
      dia: "12/07/2025",
      horario: "13:20",
      nomeRestaurante: "Restaurante Sabor Caseiro",
      primeiroItem: "1x Feijoada",
      status: "concluido"
    },
    {
      id: 3,
      dia: "10/07/2025",
      horario: "20:15",
      nomeRestaurante: "Lanchonete do Campus",
      primeiroItem: "2x Hambúrguer Artesanal",
      status: "concluido"
    }
  ]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleVisualizarPedido = () => {
    console.log('Abrir modal de visualização do pedido');
    // Aqui você pode implementar a navegação para o modal ou tela de detalhes do pedido
  };

  const handlePecaNovamanete = (pedido) => {
    console.log('Peça Novamente pressionado para:', pedido.nomeRestaurante);
    // Aqui você pode implementar a navegação para o restaurante ou adicionar ao carrinho
  };

  // Verificar se existe pedido atual
  const temPedidoAtual = pedidoAtual && pedidoAtual.status !== 'concluido';

  const renderOldOrderItem = ({ item }) => (
    <OldOrder
      dia={item.dia}
      horario={item.horario}
      nomeRestaurante={item.nomeRestaurante}
      primeiroItem={item.primeiroItem}
      onPecaNovamantePress={() => handlePecaNovamanete(item)}
    />
  );

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

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEDCF9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    textAlign: 'center',
  },

  placeholder: {
    width: 40,
    height: 40,
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

  bottomSpacing: {
    height: 50,
  },
});

export default ClientePedidos;