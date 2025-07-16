import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import RestaurantService from '../../services/RestaurantService';
import SuporteIcon from '../../assets/icons/suporteIcon';
import SairIcon from '../../assets/icons/sairIcon';

const RestauranteConta = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [dadosCompletos, setDadosCompletos] = useState(null);
  const [loading, setLoading] = useState(true);

  const profileImage = require('../../assets/images/imagemPerfil.png'); 

  useEffect(() => {
    carregarDadosRestaurante();
  }, []);

  const carregarDadosRestaurante = async () => {
    try {
      setLoading(true);
      
      if (user?.usuario_id) {
        console.log('🔄 Carregando dados do restaurante para usuário:', user.usuario_id);
        
        // Verificar se o método existe
        if (typeof RestaurantService.getDadosCompletos === 'function') {
          const dados = await RestaurantService.getDadosCompletos(user.usuario_id);
          if (dados) {
            console.log('📍 Dados do restaurante carregados:', dados);
            setDadosCompletos(dados);
          } else {
            console.log('⚠️ Nenhum dado encontrado para o usuário');
          }
        } else {
          console.error('❌ Método getDadosCompletos não encontrado no RestaurantService');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do restaurante:', error);
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
    // Funcionalidade será implementada futuramente
    console.log('Recarregar carteira');
  };

  const handleSuporte = () => {
    // Funcionalidade será implementada futuramente
    console.log('Suporte');
  };

  const formatarSaldo = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return 'Telefone não informado';
    
    // Se já está formatado, retorna como está
    if (telefone.includes('(') && telefone.includes(')')) {
      return telefone;
    }
    
    // Remove caracteres não numéricos
    const numbers = telefone.replace(/\D/g, '');
    
    // Formata para (XX) XXXXX-XXXX
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    
    // Formata para (XX) XXXX-XXXX
    if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    
    return telefone;
  };

  const saldo = dadosCompletos?.saldo || 0;
  const nome = dadosCompletos?.nome || user?.nome || 'Nome do Restaurante';
  const email = dadosCompletos?.email || user?.email || 'email@exemplo.com';
  const telefone = dadosCompletos?.telefone;
  const localizacao = dadosCompletos?.local || dadosCompletos?.localizacao || 'Localização não informada';

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

        {/* Telefone */}
        <Text style={styles.fieldLabel}>Telefone</Text>
        <Text style={styles.fieldValue}>{formatarTelefone(telefone)}</Text>
        <View style={styles.separator} />

        {/* Localização */}
        <Text style={styles.fieldLabel}>Localização</Text>
        <Text style={styles.fieldValue}>{localizacao}</Text>
        <View style={styles.separator} />

        {/* Carteira */}
        <Text style={styles.fieldLabel}>Carteira</Text>
        <Text style={styles.carteiraValue}>{formatarSaldo(saldo)}</Text>
        <TouchableOpacity 
          style={styles.recarregarButton}
          onPress={handleRecarregarCarteira}
        >
          <Text style={styles.recarregarButtonText}>Retirar Dinheiro</Text>
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

export default RestauranteConta;