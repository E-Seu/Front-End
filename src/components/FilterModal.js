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
  Image
} from 'react-native';
import CustomInput from './CustomInput';
import CheckboxIcon from '../assets/icons/checkboxIcon';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FilterModal = ({ visible, onClose, onApplyFilters }) => {
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState([]);

  // Opções de restrições alimentares - CORRIGIDO para usar os mesmos nomes do backend
  const restrictionOptions = [
    { 
      id: 'Vegano', 
      label: 'Vegano', 
      image: require('../assets/Vegan.png') 
    },
    { 
      id: 'Sem Glúten', 
      label: 'Sem Glúten', 
      image: require('../assets/GlutenFree.png') 
    },
    { 
      id: 'Sem Amendoim', 
      label: 'Sem Amendoim', 
      image: require('../assets/PeanutFree.png') 
    },
    { 
      id: 'Sem Lactose', 
      label: 'Sem Lactose', 
      image: require('../assets/LactoseFree.png') 
    },
  ];

  const handleRestrictionToggle = (restrictionId) => {
    setSelectedRestrictions(prev => {
      if (prev.includes(restrictionId)) {
        return prev.filter(id => id !== restrictionId);
      } else {
        return [...prev, restrictionId];
      }
    });
  };

  const handleApplyFilters = () => {
    const filters = {
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      restrictions: selectedRestrictions // Agora usa os nomes corretos como 'Sem Lactose', 'Vegano', etc.
    };
    
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    
    onClose();
  };

  const handleClearFilters = () => {
    setMaxPrice('');
    setSelectedRestrictions([]);
  };

  const renderRestrictionItem = (restriction) => (
    <TouchableOpacity
      key={restriction.id}
      style={styles.restrictionItem}
      onPress={() => handleRestrictionToggle(restriction.id)}
      activeOpacity={0.7}
    >
      <View style={styles.restrictionLeft}>
        <CheckboxIcon 
          isChecked={selectedRestrictions.includes(restriction.id)}
          width={24}
          height={24}
        />
        <Text style={styles.restrictionLabel}>{restriction.label}</Text>
      </View>
      
      <Image 
        source={restriction.image}
        style={styles.restrictionImage}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouch} 
          onPress={onClose}
          activeOpacity={1}
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
            >
              {/* Seção de Preço */}
              <Text style={styles.sectionTitle}>Preço</Text>
              <View style={styles.separator} />
              
              <Text style={styles.fieldLabel}>Até</Text>
              <CustomInput
                placeholder="Valor"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                style={styles.inputContainer}
              />
              
              <View style={styles.separator} />
              
              {/* Seção de Restrições */}
              <View style={styles.restrictionsCard}>
                <Text style={styles.cardTitle}>Selos de Restrição Alimentar</Text>
                
                <View style={styles.restrictionsList}>
                  {restrictionOptions.map(renderRestrictionItem)}
                </View>
              </View>
              
              {/* Espaçamento para os botões fixos */}
              <View style={styles.bottomSpacing} />
            </ScrollView>
            
            {/* Botões fixos na parte inferior */}
            <View style={styles.fixedBottomContainer}>
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={handleClearFilters}
                activeOpacity={0.8}
              >
                <Text style={styles.clearButtonText}>Limpar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyButton} 
                onPress={handleApplyFilters}
                activeOpacity={0.8}
              >
                <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
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
    height: screenHeight * 0.6,
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
    marginBottom: 40,
    borderRadius: 30,
  },
  
  scrollContainer: {
    flex: 1,
  },
  
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
  },
  
  separator: {
    height: 1,
    backgroundColor: '#D9C0E7',
    marginVertical: 16,
  },
  
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    marginBottom: 8,
  },
  
  inputContainer: {
    marginBottom: 0,
  },
  
  restrictionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    elevation: 5,
    borderColor: '#F0F0F0',
  },
  
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#222222',
    marginBottom: 16,
  },
  
  restrictionsList: {
    gap: 5,
  },
  
  restrictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  restrictionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  restrictionLabel: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#222222',
    marginLeft: 12,
  },
  
  restrictionImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  
  bottomSpacing: {
    height: 80,
  },
  
  fixedBottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    gap: 12,
  },
  
  clearButton: {
    flex: 1,
    height: 41,
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9C0E7',
  },
  
  clearButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#4E0777',
  },
  
  applyButton: {
    flex: 1,
    height: 41,
    backgroundColor: '#D9C0E7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  applyButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#4E0777',
  },
});

export default FilterModal;