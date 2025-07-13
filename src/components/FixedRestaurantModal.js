import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';

const { height: screenHeight } = Dimensions.get('window');

const FixedRestaurantModal = ({ visible, onClose, formData, navigation }) => {
  const [modalData, setModalData] = useState({
    localizacao: '',
    horarioAbertura: '',
    horarioFechamento: '',
  });

  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animar entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animar saída
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleInputChange = (field, value) => {
    setModalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConcluirCadastro = () => {
    // Aqui você pode processar todos os dados do cadastro
    const dadosCompletos = {
      ...formData,
      ...modalData
    };
    
    console.log('Dados completos do cadastro:', dadosCompletos);
    
    // Fechar modal e navegar para tela de sucesso
    onClose();
    navigation.navigate('RegisterSucess');
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={closeModal}
    >
      {/* Overlay clicável */}
      <Animated.View 
        style={[styles.overlay, { opacity: overlayOpacity }]}
      >
        <TouchableOpacity 
          style={styles.overlayTouch} 
          onPress={closeModal}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>
              Quase lá para começar a vender!
            </Text>

            <View style={styles.formContainer}>
              <CustomInput
                label="Localização do Restaurante"
                placeholder="Digite a localização do restaurante"
                value={modalData.localizacao}
                onChangeText={(value) => handleInputChange('localizacao', value)}
              />

              <Text style={styles.horarioLabel}>Horário de funcionamento</Text>
              
              <View style={styles.horarioContainer}>
                <View style={styles.horarioInputContainer}>
                  <CustomInput
                    label="Abertura"
                    placeholder="08:00"
                    value={modalData.horarioAbertura}
                    onChangeText={(value) => handleInputChange('horarioAbertura', value)}
                    style={styles.horarioInput}
                  />
                </View>

                <View style={styles.horarioInputContainer}>
                  <CustomInput
                    label="Fechamento"
                    placeholder="18:00"
                    value={modalData.horarioFechamento}
                    onChangeText={(value) => handleInputChange('horarioFechamento', value)}
                    style={styles.horarioInput}
                  />
                </View>
              </View>
            </View>

            <CustomButton
              title="Concluir cadastro"
              variant="primary"
              size="small"
              onPress={handleConcluirCadastro}
              style={styles.concluirButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTouch: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Nunito-Regular',
    color: '#4F0072',
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    marginBottom: 30,
  },
  horarioLabel: {
    fontSize: 14,
    color: '#888888',
    fontFamily: 'Nunito-Medium',
    marginBottom: 8,
    textAlign: 'left',
  },
  horarioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  horarioInputContainer: {
    flex: 1,
  },
  horarioInput: {
    marginBottom: 16,
  },
  concluirButton: {
    width: '80%',
    alignSelf: 'center',
  },
});

export default FixedRestaurantModal;