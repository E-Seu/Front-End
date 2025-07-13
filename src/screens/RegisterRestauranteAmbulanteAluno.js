import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import RetornarIcon from '../assets/icons/retornarIcon';
import CustomInput from '../components/CustomInput';
import MobileRestaurantModal from '../components/MobileRestaurantModal';

const RegisterRestauranteAmbulanteAluno = ({ navigation }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nomeRestaurante: '',
    nomeResponsavel: '',
    matricula: '',
    email: '',
    telefone: '',
    senha: '',
    confirmacaoSenha: '',
  });

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContinuar = () => {
    // Aqui você pode adicionar validações dos campos
    console.log('Dados do formulário:', formData);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
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
                  label="Nome do Restaurante"
                  placeholder="Digite o nome do seu restaurante"
                  value={formData.nomeRestaurante}
                  onChangeText={(value) => handleInputChange('nomeRestaurante', value)}
                />

                <CustomInput
                  label="Nome do responsável"
                  placeholder="Digite seu nome completo"
                  value={formData.nomeResponsavel}
                  onChangeText={(value) => handleInputChange('nomeResponsavel', value)}
                />

                <CustomInput
                  label="Matrícula"
                  placeholder="Digite sua matrícula"
                  value={formData.matricula}
                  onChangeText={(value) => handleInputChange('matricula', value)}
                />

                <CustomInput
                  label="Email para contato"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
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

              <View style={styles.continueContainer}>
                <TouchableOpacity onPress={handleContinuar}>
                  <Text style={styles.continueText}>Continuar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modal */}
        <MobileRestaurantModal
          visible={showModal}
          onClose={handleModalClose}
          formData={formData}
          navigation={navigation}
        />
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
    marginBottom: 20,
  },
  continueContainer: {
    alignItems: 'flex-end',
    paddingRight: 10,
    marginBottom: 20,
  },
  continueText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
  },
});

export default RegisterRestauranteAmbulanteAluno;