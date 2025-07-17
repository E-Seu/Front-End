import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import EntregadorService from '../../services/EntregadorService';
import LoginService from '../../services/LoginService';
import WithdrawModal from '../../components/WithdrawModal';
import SuporteIcon from '../../assets/icons/suporteIcon';
import SairIcon from '../../assets/icons/sairIcon';
import { Linking } from 'react-native';

const EntregadorConta = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [dadosEntregador, setDadosEntregador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(0);
  const [usuarioId, setUsuarioId] = useState(null);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);

  const profileImage = require('../../assets/images/imagemPerfil.png'); 

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (usuarioId) {
      carregarDadosEntregador();
      carregarSaldoEntregador();
    }
  }, [usuarioId]);

  const loadUserData = async () => {
    try {
      // Primeiro tentar do contexto de autenticação
      let userId = user?.id || user?.usuario_id;
      
      // Se não tiver, tentar do LoginService
      if (!userId) {
        const currentUser = await LoginService.getCurrentUser();
        if (currentUser.success) {
          userId = currentUser.user.id || currentUser.user.usuario_id;
        }
      }
      
      if (userId) {
        setUsuarioId(userId);
        console.log('✅ Usuario ID definido na Conta:', userId);
      } else {
        console.error('❌ Não foi possível obter ID do usuário');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
    }
  };

  const carregarDadosEntregador = async () => {
    try {
      setLoading(true);
      if (usuarioId) {
        // ✅ Usar usuario_id para buscar dados
        const dados = await EntregadorService.getEntregadorByUsuarioId(usuarioId);
        if (dados) {
          setDadosEntregador(dados);
          console.log('✅ Dados do entregador carregados:', dados);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do entregador:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarSaldoEntregador = async () => {
    try {
      if (usuarioId) {
        // ✅ Usar usuario_id para buscar saldo
        const saldoData = await EntregadorService.visualizarSaldoEntregador(usuarioId);
        if (saldoData) {
          setSaldo(saldoData.saldo || 0);
          console.log('✅ Saldo carregado:', saldoData.saldo);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar saldo do entregador:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair da sua conta?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          onPress: async () => {
            try {
              await logout();
              // Não precisa navegar manualmente, o AuthContext vai gerenciar isso
              // O Routes.js vai automaticamente mostrar as rotas públicas após o logout
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Erro ao sair da conta. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const handleRetirarDinheiro = () => {
    setWithdrawModalVisible(true);
  };

  const handleConfirmWithdraw = async () => {
    try {
      if (usuarioId) {
        // ✅ Zerar saldo do entregador
        await EntregadorService.atualizarSaldoEntregador(usuarioId, 0);
        setSaldo(0);
        
        Alert.alert(
          'Retirada Confirmada',
          'Sua solicitação de retirada foi processada com sucesso! O valor será transferido para sua conta em até 2 dias úteis.',
          [{ text: 'OK' }]
        );
        
        console.log('✅ Retirada de dinheiro processada');
      }
    } catch (error) {
      console.error('❌ Erro ao processar retirada:', error);
      Alert.alert('Erro', 'Erro ao processar retirada. Tente novamente.');
      throw error;
    }
  };

  const handleSuporte = () => {
    const email = 'gabryella.rodrigues@aluno.uece.br'; // coloque o email desejado
    const assunto = 'Suporte - App';
    const corpo = 'Olá, preciso de ajuda com...';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    Linking.openURL(mailtoUrl);
  };

  const formatarSaldo = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarVeiculo = (veiculo) => {
    if (!veiculo) return 'Veículo não informado';
    return veiculo.charAt(0).toUpperCase() + veiculo.slice(1);
  };

  const nome = user?.nome || 'Nome do Entregador';
  const email = user?.email || 'email@exemplo.com';
  const veiculo = dadosEntregador?.veiculo;
  const localizacao = dadosEntregador?.localizacao_atual || 'Localização não informada';
  const disponivel = dadosEntregador?.disponivel !== undefined ? dadosEntregador.disponivel : true;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={profileImage}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{nome}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.saldoLabel}>Saldo Total</Text>
          <Text style={styles.saldoValue}>{formatarSaldo(saldo)}</Text>
        </View>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Dados da Conta</Text>
        <View style={styles.separator} />

        {/* E-mail */}
        <Text style={styles.fieldLabel}>E-mail</Text>
        <Text style={styles.fieldValue}>{email}</Text>
        <View style={styles.separator} />

        {/* Status */}
        <Text style={styles.fieldLabel}>Status</Text>
        <Text style={[styles.fieldValue, disponivel ? styles.statusDisponivel : styles.statusIndisponivel]}>
          {disponivel ? 'Disponível' : 'Indisponível'}
        </Text>
        <View style={styles.separator} />

        {/* Carteira */}
        <Text style={styles.fieldLabel}>Carteira</Text>
        <Text style={styles.carteiraValue}>{formatarSaldo(saldo)}</Text>
        <TouchableOpacity 
          style={styles.retirarButton}
          onPress={handleRetirarDinheiro}
        >
          <Text style={styles.retirarButtonText}>Retirar Dinheiro</Text>
        </TouchableOpacity>
        <View style={styles.separator} />

        {/* Suporte */}
        <TouchableOpacity style={styles.menuItem} onPress={handleSuporte}>
          <SuporteIcon width={24} height={24} color="#455A64" />
          <Text style={styles.menuItemText}>Suporte</Text>
        </TouchableOpacity>
        <View style={styles.separator} />

        {/* Sair */}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <SairIcon width={24} height={24} color="#455A64" />
          <Text style={styles.menuItemText}>Sair</Text>
        </TouchableOpacity>
      </View>
      <WithdrawModal
          visible={withdrawModalVisible}
          onClose={() => setWithdrawModalVisible(false)}
          onConfirm={handleConfirmWithdraw}
          currentBalance={saldo}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 23.5,
    marginRight: 12,
  },

  userName: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#263238',
  },

  headerRight: {
    alignItems: 'flex-start',
    marginRight: 15,
  },

  saldoLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#263238',
  },

  saldoValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#888888',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#455A64',
  },

  separator: {
    height: 1,
    backgroundColor: '#D9C0E7',
    marginVertical: 10,
  },

  fieldLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#455A64',
    marginBottom: 4,
  },

  fieldValue: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#888888',
  },

  statusDisponivel: {
    color: '#4CAF50',
  },

  statusIndisponivel: {
    color: '#F44336',
  },

  carteiraValue: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 28,
    color: '#455A64',
    marginBottom: 12,
  },

  retirarButton: {
    width: 162,
    height: 26,
    borderRadius: 32,
    marginBottom: 20,
    backgroundColor: '#D9C0E7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  retirarButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#4E0777',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },

  menuItemText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#455A64',
    marginLeft: 12,
  },
});

export default EntregadorConta;