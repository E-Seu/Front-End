import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import RetornarIcon from '../assets/icons/retornarIcon';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import RegisterService from '../services/RegisterService';

const RegisterCliente = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nome: '',
    emailInstitucional: '',
    telefone: '',
    senha: '',
    confirmacaoSenha: '',
  });
  const [loading, setLoading] = useState(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConcluirCadastro = async () => {
    try {
      setLoading(true);
      
      // Validar campos obrigatórios
      const camposObrigatorios = ['nome', 'emailInstitucional', 'senha', 'confirmacaoSenha'];
      const camposFaltando = RegisterService.validarCampos(formData, camposObrigatorios);
      
      if (camposFaltando.length > 0) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
        return;
      }
      
      // Validar email
      if (!RegisterService.validarEmail(formData.emailInstitucional)) {
        Alert.alert('Erro', 'Email inválido');
        return;
      }
      
      // Validar senha
      if (!RegisterService.validarSenha(formData.senha)) {
        Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
        return;
      }
      
      // Verificar se senhas coincidem
      if (!RegisterService.verificarSenhas(formData.senha, formData.confirmacaoSenha)) {
        Alert.alert('Erro', 'Senhas não coincidem');
        return;
      }
      
      // Tentar registrar cliente
      const resultado = await RegisterService.registrarCliente({
        nome: formData.nome,
        email: formData.emailInstitucional,
        senha: formData.senha
      });
      
      if (resultado.success) {
        console.log('✅ Cliente cadastrado com sucesso:', resultado.data);
        
        // Navegar para tela de sucesso
        navigation.navigate('RegisterSucess');
      } else {
        Alert.alert('Erro', resultado.error || 'Erro ao cadastrar cliente');
      }
      
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      Alert.alert('Erro', 'Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <RetornarIcon width={24} height={24} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>
                Preencha seus dados, queremos te conhecer
              </Text>

              <View style={styles.formContainer}>
                <CustomInput
                  label="Nome"
                  placeholder="Digite seu nome completo"
                  value={formData.nome}
                  onChangeText={(value) => handleInputChange('nome', value)}
                />

                <CustomInput
                  label="Email institucional"
                  placeholder="Digite seu email institucional"
                  value={formData.emailInstitucional}
                  onChangeText={(value) => handleInputChange('emailInstitucional', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <CustomInput
                  label="Telefone para contato"
                  placeholder="Digite seu telefone"
                  value={formData.telefone}
                  onChangeText={(value) => handleInputChange('telefone', value)}
                  keyboardType="phone-pad"
                />

                <CustomInput
                  label="Senha"
                  placeholder="Digite sua senha"
                  value={formData.senha}
                  onChangeText={(value) => handleInputChange('senha', value)}
                  secureTextEntry={true}
                />

                <CustomInput
                  label="Confirmação de Senha"
                  placeholder="Digite sua senha novamente"
                  value={formData.confirmacaoSenha}
                  onChangeText={(value) => handleInputChange('confirmacaoSenha', value)}
                  secureTextEntry={true}
                />
              </View>

              <CustomButton
                title="Concluir cadastro"
                variant="primary"
                size="small"
                onPress={handleConcluirCadastro}
                style={styles.concluirButton}
                disabled={loading}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEDCF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito-Regular',
    color: '#4F0072',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  formContainer: {
    flex: 1,
    marginBottom: 30,
  },
  concluirButton: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default RegisterCliente;