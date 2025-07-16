import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import CustomInput from './CustomInput';
import CheckboxIcon from '../assets/icons/checkboxIcon';
import RestaurantService from '../services/RestaurantService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AddProductModal = ({ 
  visible, 
  onClose, 
  restaurantId,
  onProductAdded 
}) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [tempoPreparo, setTempoPreparo] = useState('30');
  const [selectedSelos, setSelectedSelos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Opções de selos alimentares
  const selosOptions = [
    { 
      id: 'vegano', 
      label: 'Vegano', 
      image: require('../assets/Vegan.png') 
    },
    { 
      id: 'sem_gluten', 
      label: 'Sem Glúten', 
      image: require('../assets/GlutenFree.png') 
    },
    { 
      id: 'sem_amendoim', 
      label: 'Sem Amendoim', 
      image: require('../assets/PeanutFree.png') 
    },
    { 
      id: 'sem_lactose', 
      label: 'Sem Lactose', 
      image: require('../assets/LactoseFree.png') 
    },
  ];

  const handleSeloToggle = (seloId) => {
    setSelectedSelos(prev => {
      if (prev.includes(seloId)) {
        return prev.filter(id => id !== seloId);
      } else {
        return [...prev, seloId];
      }
    });
  };

  const handleCadastrarProduto = async () => {
    // Validações
    if (!nome.trim()) {
      Alert.alert('Erro', 'Nome do produto é obrigatório');
      return;
    }

    if (!descricao.trim()) {
      Alert.alert('Erro', 'Descrição do produto é obrigatória');
      return;
    }

    if (!preco.trim()) {
      Alert.alert('Erro', 'Preço do produto é obrigatório');
      return;
    }

    const precoNumerico = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoNumerico) || precoNumerico <= 0) {
      Alert.alert('Erro', 'Preço deve ser um número válido maior que zero');
      return;
    }

    if (!restaurantId) {
      Alert.alert('Erro', 'ID do restaurante não encontrado');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Cadastrando produto...');

      // Preparar dados do produto
      const selosData = {
        sem_lactose: selectedSelos.includes('sem_lactose'),
        sem_gluten: selectedSelos.includes('sem_gluten'),
        sem_amendoim: selectedSelos.includes('sem_amendoim'),
        vegano: selectedSelos.includes('vegano')
      };

      const productData = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        preco: precoNumerico, // ✅ Usar 'preco' consistentemente
        tempo_preparo: parseInt(tempoPreparo) || 30,
        disponivel: true,
        selos: selosData
      };

      console.log('📦 Dados do produto:', productData);

      // Adicionar produto via API
      const novoProduto = await RestaurantService.addProduct(restaurantId, productData);

      console.log('✅ Produto cadastrado com sucesso:', novoProduto);
      
      // Notificar o componente pai
      if (onProductAdded) {
        onProductAdded(novoProduto);
      }

      // Limpar campos
      setNome('');
      setDescricao('');
      setPreco('');
      setTempoPreparo('30');
      setSelectedSelos([]);

      // Fechar modal
      onClose();

      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao cadastrar produto:', error);
      
      // ✅ Melhor tratamento de erro
      let errorMessage = 'Ocorreu um erro ao cadastrar o produto.';
      
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      // Limpar campos ao fechar
      setNome('');
      setDescricao('');
      setPreco('');
      setTempoPreparo('30');
      setSelectedSelos([]);
      onClose();
    }
  };

  const renderSeloItem = (selo) => (
    <TouchableOpacity
      key={selo.id}
      style={styles.seloItem}
      onPress={() => handleSeloToggle(selo.id)}
      activeOpacity={0.7}
    >
      <View style={styles.seloLeft}>
        <CheckboxIcon 
          isChecked={selectedSelos.includes(selo.id)}
          width={24}
          height={24}
        />
        <Text style={styles.seloLabel}>{selo.label}</Text>
      </View>
      
      <Image 
        source={selo.image}
        style={styles.seloImage}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCloseModal}
    >
      {/* Overlay */}
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouch} 
          onPress={handleCloseModal}
          activeOpacity={1}
          disabled={loading}
        />
        
        {/* Modal Content */}
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            {/* Handle do modal */}
            <View style={styles.handle} />
            
            {/* Conteúdo scrollável */}
            <ScrollView 
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={!loading}
            >
              {/* Título */}
              <Text style={styles.title}>Preencha as informações do produto:</Text>

              {/* Nome do Produto */}
              <CustomInput
                label="Nome do Produto"
                placeholder="Ex: Hambúrguer Especial"
                value={nome}
                onChangeText={setNome}
                style={styles.inputContainer}
                editable={!loading}
              />

              {/* Descrição do Produto */}
              <CustomInput
                label="Descrição do Produto"
                placeholder="Ex: Hambúrguer com carne bovina, queijo e salada"
                value={descricao}
                onChangeText={setDescricao}
                style={styles.inputContainer}
                multiline
                numberOfLines={3}
                editable={!loading}
              />

              {/* Preço */}
              <CustomInput
                label="Preço"
                placeholder="Ex: 25,90"
                value={preco}
                onChangeText={setPreco}
                keyboardType="numeric"
                style={styles.inputContainer}
                editable={!loading}
              />

              {/* Tempo de Preparo */}
              <CustomInput
                label="Tempo de Preparo (minutos)"
                placeholder="Ex: 30"
                value={tempoPreparo}
                onChangeText={setTempoPreparo}
                keyboardType="numeric"
                style={styles.inputContainer}
                editable={!loading}
              />

              {/* Card de Selos */}
              <View style={styles.selosCard}>
                <Text style={styles.cardTitle}>Selos de Restrição Alimentar</Text>
                
                <View style={styles.selosList}>
                  {selosOptions.map(renderSeloItem)}
                </View>
              </View>

              {/* Espaçamento para o botão fixo */}
              <View style={styles.bottomSpacing} />
            </ScrollView>
            
            {/* Botão fixo na parte inferior */}
            <View style={styles.fixedBottomContainer}>
              <TouchableOpacity 
                style={[styles.cadastrarButton, loading && styles.cadastrarButtonDisabled]} 
                onPress={handleCadastrarProduto}
                activeOpacity={loading ? 1 : 0.8}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#4E0777" />
                    <Text style={styles.loadingText}>Cadastrando...</Text>
                  </View>
                ) : (
                  <Text style={styles.cadastrarButtonText}>Cadastrar Produto</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: screenWidth * 0.9,
    height: screenHeight * 0.85,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  keyboardView: {
    flex: 1,
  },
  
  handle: {
    width: 80,
    height: 6,
    backgroundColor: '#D9C0E7',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 30,
  },
  
  scrollContainer: {
    flex: 1,
  },
  
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#4F0072',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },

  inputContainer: {
    marginBottom: 16,
  },

  selosCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    marginTop: 8,
    marginBottom: 16,
  },
  
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#222222',
    marginBottom: 16,
  },
  
  selosList: {
    gap: 8,
  },
  
  seloItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  seloLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  seloLabel: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#222222',
    marginLeft: 12,
  },
  
  seloImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },

  bottomSpacing: {
    height: 80,
  },
  
  fixedBottomContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  
  cadastrarButton: {
    height: 41,
    backgroundColor: '#D9C0E7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cadastrarButtonDisabled: {
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: '#888888',
  },
  
  cadastrarButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#4E0777',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  loadingText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#4E0777',
  },
});

export default AddProductModal;