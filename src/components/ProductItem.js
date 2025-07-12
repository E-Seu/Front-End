import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MaisIcon from '../assets/icons/maisIcon';
import MenosIcon from '../assets/icons/menosIcon';

const ProductItem = ({ 
  nome = "Nome do Produto",
  descricao = "Descrição do produto",
  valor = 0,
  disponivel = true, // Se o produto está disponível
  selos = {}, // Objeto com os selos: { sem_lactose: false, sem_gluten: true, sem_amendoim: true, vegano: false }
  onQuantityChange
}) => {
  const [quantidade, setQuantidade] = useState(0);
  const [maisPressionado, setMaisPressionado] = useState(false);
  const [menosPressionado, setMenosPressionado] = useState(false);

  // Mapeamento das imagens de selos (baseado na estrutura da API)
  const selosImages = {
    sem_lactose: require('../assets/LactoseFree.png'),
    sem_gluten: require('../assets/GlutenFree.png'),
    sem_amendoim: require('../assets/PeanutFree.png'),
    vegano: require('../assets/Vegan.png'),
  };

  const handleMais = () => {
    if (!disponivel) return; // Não permite adicionar se não estiver disponível
    
    const novaQuantidade = quantidade + 1;
    setQuantidade(novaQuantidade);
    if (onQuantityChange) {
      onQuantityChange(novaQuantidade);
    }
  };

  const handleMenos = () => {
    if (quantidade > 0) {
      const novaQuantidade = quantidade - 1;
      setQuantidade(novaQuantidade);
      if (onQuantityChange) {
        onQuantityChange(novaQuantidade);
      }
    }
  };

  const formatarValor = (valor) => {
    // Converter string para number se necessário
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;
    return `R$ ${valorNumerico.toFixed(2).replace('.', ',')}`;
  };

  // Determinar se os ícones devem estar na versão colorida
  const shouldShowColoredIcons = quantidade > 0;

  // Função para obter selos ativos
  const getSelosAtivos = () => {    
    if (!selos || typeof selos !== 'object') {
      console.log('Selos inválidos ou vazios');
      return [];
    }
    
    const selosAtivos = Object.entries(selos)
      .filter(([key, value]) => {
        // Filtrar apenas os selos válidos (não incluir produto_id)
        const isValidSelo = ['sem_lactose', 'sem_gluten', 'sem_amendoim', 'vegano'].includes(key);
        
        // Verificar se o selo está ativo (true)
        const isActive = value === true;
        
        console.log(`Selo ${key}: ${value} (tipo: ${typeof value}) - Válido: ${isValidSelo}, Ativo: ${isActive}`);
        return isValidSelo && isActive;
      })
      .map(([key, _]) => key);
    
    console.log('Selos ativos encontrados:', selosAtivos);
    return selosAtivos;
  };

  // Obter lista de selos para exibir
  const selosParaExibir = getSelosAtivos();

  return (
    <View style={[styles.container, !disponivel && styles.containerIndisponivel]}>
      {/* Conteúdo principal */}
      <View style={styles.mainContent}>
        {/* Lado esquerdo - Informações do produto */}
        <View style={styles.infoContainer}>
          <Text style={[styles.nome, !disponivel && styles.textoIndisponivel]} numberOfLines={2}>
            {nome}
          </Text>
          <Text style={[styles.descricao, !disponivel && styles.textoIndisponivel]} numberOfLines={3}>
            {descricao}
          </Text>
          
          <Text style={[styles.valor, !disponivel && styles.textoIndisponivel]}>
            {formatarValor(valor)}
          </Text>

          {/* Status de disponibilidade */}
          {!disponivel && (
            <Text style={styles.statusIndisponivel}>
              Temporariamente indisponível
            </Text>
          )}
        </View>

        {/* Lado direito - Selos e controles */}
        <View style={styles.rightContainer}>
          {/* Selos alimentares */}
          {selosParaExibir.length > 0 && (
            <View style={styles.selosContainer}>
              {selosParaExibir.map((selo, index) => {
                const imagemSelo = selosImages[selo];
                                
                return imagemSelo ? (
                  <Image
                    key={`${selo}-${index}`}
                    source={imagemSelo}
                    style={[styles.seloIcon, !disponivel && styles.seloIndisponivel]}
                  />
                ) : null;
              })}
            </View>
          )}

          {/* Controles de quantidade */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPressIn={() => setMenosPressionado(true)}
              onPressOut={() => setMenosPressionado(false)}
              onPress={handleMenos}
              style={[
                styles.quantityButton, 
                (quantidade === 0 || !disponivel) && styles.disabledButton
              ]}
              disabled={quantidade === 0 || !disponivel}
            >
              <MenosIcon 
                isPressed={shouldShowColoredIcons && disponivel && (menosPressionado && quantidade > 0)} 
                width={24} 
                height={24} 
              />
            </TouchableOpacity>

            <Text style={[styles.quantityText, !disponivel && styles.textoIndisponivel]}>
              {quantidade}
            </Text>

            <TouchableOpacity
              onPressIn={() => setMaisPressionado(true)}
              onPressOut={() => setMaisPressionado(false)}
              onPress={handleMais}
              style={[styles.quantityButton, !disponivel && styles.disabledButton]}
              disabled={!disponivel}
            >
              <MaisIcon 
                isPressed={shouldShowColoredIcons && disponivel && maisPressionado} 
                width={24} 
                height={24} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#888888',
    padding: 16,
    marginTop: 10,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: '#565656',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  containerIndisponivel: {
    backgroundColor: '#F8F8F8',
    borderColor: '#CCCCCC',
    opacity: 0.7,
  },

  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 80, 
  },

  infoContainer: {
    flex: 1,
    paddingRight: 15,
    justifyContent: 'space-between',
  },

  nome: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#222222',
    marginBottom: 4,
    lineHeight: 20,
  },

  descricao: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#888888',
    marginTop: 5,
    lineHeight: 15,
    flex: 1, 
  },

  valor: {
    fontSize: 14,
    fontFamily: 'Nunito-Medium',
    color: '#4E0777',
    marginTop: 10,
  },

  statusIndisponivel: {
    fontSize: 12,
    fontFamily: 'Nunito-Medium',
    color: '#FF6B6B',
    marginTop: 4,
    fontStyle: 'italic',
  },

  textoIndisponivel: {
    color: '#999999',
  },

  rightContainer: {
    justifyContent: 'space-between', 
    alignItems: 'flex-end',
    minHeight: 80, 
    width: 100, 
  },

  selosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 100, 
  },

  seloIcon: {
    width: 22, 
    height: 22,
    marginLeft: 2,
    marginBottom: 2,
  },

  seloIndisponivel: {
    opacity: 0.5,
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
  },

  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.5,
  },

  quantityText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#E96200',
    minWidth: 20,
    textAlign: 'center',
  },
});

export default ProductItem;