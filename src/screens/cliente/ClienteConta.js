import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import ClienteService from '../../services/ClienteService';
import BalanceModal from '../../components/BalanceModal';
import SuporteIcon from '../../assets/icons/suporteIcon';
import SairIcon from '../../assets/icons/sairIcon';
import { Linking } from 'react-native';

const ClienteConta = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);

  const profileImage = require('../../assets/images/imagemPerfil.png'); 

  useEffect(() => {
    carregarDadosCliente();
  }, []);

  const carregarDadosCliente = async () => {
    try {
      setLoading(true);
      
      if (user?.usuario_id) {
        const saldoResponse = await ClienteService.visualizarSaldo(user.usuario_id);
        if (saldoResponse) {
          setSaldo(saldoResponse.saldo);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
    } finally {
      setLoading(false);
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

  const handleRecarregarCarteira = () => {
    setBalanceModalVisible(true);
  };

  const handleReloadBalance = async (valor) => {
    try {
      if (user?.usuario_id) {
        const novoSaldo = saldo + valor;
        
        // Atualizar saldo no backend
        const response = await ClienteService.atualizarSaldo(user.usuario_id, novoSaldo);
        
        if (response) {
          // Recarregar dados da tela
          await carregarDadosCliente();
          
          Alert.alert(
            'Sucesso!', 
            `Carteira recarregada com ${formatarSaldo(valor)}. Novo saldo: ${formatarSaldo(novoSaldo)}`
          );
        } else {
          throw new Error('Erro ao atualizar saldo');
        }
      }
    } catch (error) {
      console.error('Erro ao recarregar carteira:', error);
      throw error; // Re-throw para que o BalanceModal possa tratar
    }
  };

  const handleSuporte = () => {
    const email = 'gabryella.rodrigues@aluno.uece.br';
    const assunto = 'Suporte - App';
    const corpo = 'Olá, preciso de ajuda com...';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    Linking.openURL(mailtoUrl);
  };

  const formatarSaldo = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={profileImage}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{user?.nome || 'Nome do Cliente'}</Text>
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
        <Text style={styles.fieldValue}>{user?.email || 'email@exemplo.com'}</Text>
        <View style={styles.separator} />

        {/* Carteira */}
        <Text style={styles.fieldLabel}>Carteira</Text>
        <Text style={styles.carteiraValue}>{formatarSaldo(saldo)}</Text>
        <TouchableOpacity 
          style={styles.recarregarButton}
          onPress={handleRecarregarCarteira}
        >
          <Text style={styles.recarregarButtonText}>Recarregar carteira</Text>
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

      {/* Balance Modal */}
      <BalanceModal
        visible={balanceModalVisible}
        onClose={() => setBalanceModalVisible(false)}
        onReload={handleReloadBalance}
        currentBalance={saldo}
      />
    </View>
  );
};

// ...existing code...
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

  carteiraValue: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 28,
    color: '#455A64',
    marginBottom: 12,
  },

  recarregarButton: {
    width: 162,
    height: 26,
    borderRadius: 32,
    marginBottom: 20,
    backgroundColor: '#D9C0E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recarregarButtonText: {
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

export default ClienteConta;