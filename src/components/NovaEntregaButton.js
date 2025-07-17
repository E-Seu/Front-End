import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated, Pressable } from 'react-native';
import EntregadorService from '../services/EntregadorService';
import ClienteService from '../services/ClienteService';
import RestaurantService from '../services/RestaurantService';
import LoginService from '../services/LoginService';
import { useAuth } from '../context/AuthContext';
import EntregaInfoModal from './EntregaInfoModal';

const NovaEntregaButton = () => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [blinkAnim] = useState(new Animated.Value(1));
  const [pedido, setPedido] = useState(null);
  const [entregadorId, setEntregadorId] = useState(null);

  // Novos estados para nomes
  const [restauranteNome, setRestauranteNome] = useState('');
  const [clienteNome, setClienteNome] = useState('');

  // Estado para controlar se mostra o modal detalhado
  const [showDetalhe, setShowDetalhe] = useState(false);
  const [pedidoAceito, setPedidoAceito] = useState(false);

  // ✅ Carregar dados do entregador ao montar o componente
  useEffect(() => {
    loadEntregadorData();
  }, []);

  const loadEntregadorData = async () => {
    try {
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
        console.log('✅ Entregador ID definido no NovaEntregaButton:', userId);
      } else {
        console.error('❌ Não foi possível obter ID do entregador');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do entregador:', error);
    }
  };

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.4,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [blinkAnim]);

  // Busca o pedido disponível mais recente ao abrir o modal
  const handleOpenModal = async () => {
    setModalVisible(true);
    setPedidoAceito(false);
    setShowDetalhe(false);
    try {
      const pedidos = await EntregadorService.buscarPedidosDisponiveis();
      if (pedidos && pedidos.length > 0) {
        setPedido(pedidos[pedidos.length - 1]);
      } else {
        setPedido(null);
      }
    } catch {
      setPedido(null);
    }
  };

  // Busca nome do restaurante e cliente quando pedido muda
  useEffect(() => {
    const fetchNomes = async () => {
      if (pedido) {
        // Buscar nome do restaurante
        if (pedido.restaurante_id) {
          const restaurante = await RestaurantService.getRestaurantById(pedido.restaurante_id);
          setRestauranteNome(restaurante?.nome || '');
        } else {
          setRestauranteNome('');
        }
        // Buscar nome do cliente pelo usuario_id ou cliente_id
        let usuarioId = pedido.usuario_id;
        let nomeCliente = '';
        if (!usuarioId && pedido.cliente_id) {
          const cliente = await ClienteService.getCliente(pedido.cliente_id);
          usuarioId = cliente?.usuario_id;
        }
        if (usuarioId) {
          const nome = await ClienteService.getNomeClientePorUsuarioId(usuarioId);
          if (nome) {
            nomeCliente = nome;
          }
        }
        setClienteNome(nomeCliente);
      } else {
        setRestauranteNome('');
        setClienteNome('');
      }
    };
    fetchNomes();
  }, [pedido]);

  // 
  const handleAceitarPedido = async () => {
    if (pedido && entregadorId && !pedidoAceito) {
      console.log(`🔄 Entregador ${entregadorId} aceitando pedido ${pedido.pedido_id}...`);
      const resultado = await EntregadorService.aceitarPedido(entregadorId, pedido.pedido_id);
      if (resultado) {
        setPedidoAceito(true);
        setShowDetalhe(true);
        setModalVisible(false);
      }
    } else {
      console.error('❌ Não foi possível aceitar pedido:', { pedido, entregadorId, pedidoAceito });
    }
  };

  // 
  const handleRejeitarPedido = async () => {
    if (pedidoAceito) return; // Não pode rejeitar se já aceitou
    
    if (pedido && entregadorId) {
      console.log(`🔄 Entregador ${entregadorId} rejeitando pedido ${pedido.pedido_id}...`);
      await EntregadorService.rejeitarPedido(entregadorId, pedido.pedido_id);

      // Buscar próximo pedido disponível
      try {
        const pedidos = await EntregadorService.buscarPedidosDisponiveis();
        if (pedidos && pedidos.length > 0) {
          const proximoPedido = pedidos.filter(p => p.pedido_id !== pedido.pedido_id).pop();
          if (proximoPedido) {
            setPedido(proximoPedido);
            setPedidoAceito(false);
            setShowDetalhe(false);
          } else {
            setPedido(null);
            setModalVisible(false);
          }
        } else {
          setPedido(null);
          setModalVisible(false);
        }
      } catch {
        setPedido(null);
        setModalVisible(false);
      }
    }
  };
  
  const handleConcluirEntrega = () => {
    setShowDetalhe(false);
    setPedidoAceito(false);
    setPedido(null);
    // ...sua lógica de conclusão...
  };

  // 
  if (!entregadorId) {
    return null;
  }

  return (
    <>
      <Animated.View style={[styles.buttonContainer, { opacity: blinkAnim }]}>
        <TouchableOpacity
          style={styles.novaEntregaBtn}
          activeOpacity={0.8}
          onPress={handleOpenModal}
        >
          <Text style={styles.novaEntregaText}>Nova Entrega</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={modalVisible && !pedidoAceito}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: 'transparent' }]}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            {pedido ? (
              <>
                <TouchableOpacity
                  disabled={!pedidoAceito}
                  onPress={() => pedidoAceito && setShowDetalhe(true)}
                  style={{ opacity: pedidoAceito ? 1 : 0.5 }}
                >
                  <Text style={styles.modalInfoTitle}>Mais Informações:</Text>
                  <View style={styles.statusRowCentered}>
                    <View style={styles.statusDotActive} />
                    <View style={styles.statusLine} />
                    <View style={styles.statusDotActive} />
                    <View style={styles.statusLine} />
                    <View style={styles.statusDotInactive} />
                  </View>
                  <Text style={styles.modalSubtitle}>Pronto pra retirada</Text>
                  <Text style={styles.modalInfoRest}>
                    {restauranteNome || pedido.restaurante_nome || 'Nome do Restaurante'}
                  </Text>
                  <Text style={styles.modalInfo}>
                    {pedido.localizacao || 'Localização não informada'}
                  </Text>
                  <Text style={styles.modalInfo}>
                    Entregar para <Text style={styles.modalDest}>
                      {clienteNome || pedido.cliente_nome || `Cliente #${pedido.cliente_id}`}
                    </Text>
                  </Text>
                  <View style={styles.divisor} />
                  <Text style={styles.modalInfoBold}>Itens do pedido:</Text>
                  {pedido.pedido_produtos && pedido.pedido_produtos.length > 0 ? (
                    pedido.pedido_produtos.map((item, idx) => (
                      <Text style={styles.modalInfoItem} key={idx}>
                        {item.quantidade}x {item.produto?.nome} - R$ {parseFloat(item.preco_item).toFixed(2)}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.modalInfoItem}>Nenhum produto listado</Text>
                  )}
                  <View style={styles.divisor} />
                  <View style={styles.ganhoRow}>
                    <Text style={styles.modalInfoBold}>Ganho da entrega</Text>
                    <Text style={styles.modalInfoBold}>R$ {parseFloat(pedido.preco_total).toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.botoesRow}>
                  <TouchableOpacity
                    style={styles.rejeitarBtn}
                    onPress={handleRejeitarPedido}
                    disabled={pedidoAceito}
                  >
                    <Text style={styles.rejeitarText}>Rejeitar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.aceitarBtn}
                    onPress={handleAceitarPedido}
                    disabled={pedidoAceito}
                  >
                    <Text style={styles.aceitarText}>Aceitar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.modalInfo}>Nenhum pedido disponível no momento.</Text>
            )}
            {!pedido && (
              <TouchableOpacity
                style={styles.fecharBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.fecharText}>Fechar</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal suspenso de informações do entregador após aceitar */}
      <Modal
        visible={showDetalhe && pedidoAceito}
        animationType="fade"
        transparent
        onRequestClose={() => {}}
      >
        <View style={styles.infoModalOverlay}>
          <EntregaInfoModal
            pedido={pedido}
            restauranteNome={restauranteNome}
            clienteNome={clienteNome}
            entregadorId={entregadorId}
            onConcluirEntrega={handleConcluirEntrega}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  novaEntregaBtn: {
    backgroundColor: '#FF9900',
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#FF9900',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  novaEntregaText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalBox: {
    width: '88%',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    marginBottom: 80,
  },
  modalInfoTitle: {
    fontSize: 15,
    color: '#4E0777',
    fontFamily: 'Nunito-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    // Remova se não quiser usar mais
  },
  statusRowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centraliza horizontalmente
    width: '100%',
    marginVertical: 8,
  },
  statusDotActive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8B0BD5',
  },
  statusDotInactive: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  statusLine: {
    width: 32,
    height: 4,
    backgroundColor: '#8B0BD5',
    borderRadius: 2,
    marginHorizontal: 2,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#FF9900',
    fontFamily: 'Nunito-Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInfoRest: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'Nunito-Bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  modalInfo: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'Nunito-Regular',
    marginBottom: 2,
    textAlign: 'center',
  },
  modalInfoBold: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'Nunito-Bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  modalInfoItem: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Nunito-Regular',
    marginBottom: 2,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  modalDest: {
    color: '#4E0777',
    fontFamily: 'Nunito-Bold',
  },
  divisor: {
    width: '100%',
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 8,
  },
  ganhoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  botoesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
    gap: 16,
  },
  rejeitarBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#8B0BD5',
    borderRadius: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    marginRight: 8,
  },
  rejeitarText: {
    color: '#8B0BD5',
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
  },
  aceitarBtn: {
    flex: 1,
    backgroundColor: '#E6D6F7',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  aceitarText: {
    color: '#4E0777',
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
  },
  fecharBtn: {
    marginTop: 18,
    backgroundColor: '#F2F2F2',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  fecharText: {
    color: '#8B0BD5',
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
  },
  infoModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  infoModalBox: {
    width: '88%',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    marginBottom: 80,
  },
  infoModalTitle: {
    fontSize: 16,
    color: '#8B0BD5',
    fontFamily: 'Nunito-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default NovaEntregaButton;