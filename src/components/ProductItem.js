import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MaisIcon from '../assets/icons/maisIcon';
import MenosIcon from '../assets/icons/menosIcon';

const ProductItem = ({ 
  produto_id,
  restaurante_id,
  nome = "Nome do Produto",
  descricao = "Descrição do produto",
  valor = 0,
  preco = 0,
  tempo_preparo = 0,
  disponivel = true,
  restauranteDisponivel = true, // ✅ Nova prop para status do restaurante
  selos = {},
  onQuantityChange
}) => {
  const [quantidade, setQuantidade] = useState(0);
  const [maisPressionado, setMaisPressionado] = useState(false);
  const [menosPressionado, setMenosPressionado] = useState(false);

  
  const valorFinal = valor || preco || 0;

  // Determinar disponibilidade final (produto E restaurante devem estar disponíveis)
  const disponibilidadeFinal = disponivel && restauranteDisponivel;

  // Mapeamento das imagens de selos
  const selosImages = {
    sem_lactose: require('../assets/LactoseFree.png'),
    sem_gluten: require('../assets/GlutenFree.png'),
    sem_amendoim: require('../assets/PeanutFree.png'),
    vegano: require('../assets/Vegan.png'),
  };

  const handleMais = () => {
    if (!disponibilidadeFinal) return; // ✅ Usar disponibilidade final
    
    const novaQuantidade = quantidade + 1;
    setQuantidade(novaQuantidade);
    
    if (onQuantityChange) {
      onQuantityChange(novaQuantidade, {
        produto_id,
        restaurante_id,
        nome,
        valor: valorFinal,
        tempo_preparo,
        disponivel: disponibilidadeFinal
      });
    }
  };

  const handleMenos = () => {
    if (!disponibilidadeFinal) return; // Usar disponibilidade final
    
    if (quantidade > 0) {
      const novaQuantidade = quantidade - 1;
      setQuantidade(novaQuantidade);
      
      if (onQuantityChange) {
        onQuantityChange(novaQuantidade, {
          produto_id,
          restaurante_id,
          nome,
          valor: valorFinal,
          tempo_preparo,
          disponivel: disponibilidadeFinal
        });
      }
    }
  };

  // CORREÇÃO: Função de formatação igual ao RestaurantService
  const formatarValor = (valor) => {
    let valorNumerico;
    
    if (valor === null || valor === undefined) {
      valorNumerico = 0;
    } else if (typeof valor === 'string') {
      valorNumerico = parseFloat(valor);
    } else if (typeof valor === 'number') {
      valorNumerico = valor;
    } else if (typeof valor === 'object' && valor !== null) {
      // Para Decimal do Python/FastAPI
      valorNumerico = parseFloat(valor.toString());
    } else {
      valorNumerico = parseFloat(valor) || 0;
    }
    
    // Verificar se é um número válido
    if (isNaN(valorNumerico)) {
      console.warn('⚠️ Valor inválido para formatação:', valor);
      valorNumerico = 0;
    }
    
    return `R$ ${valorNumerico.toFixed(2).replace('.', ',')}`;
  };

  const formatarTempoPreparo = (tempo) => {
    if (!tempo || tempo === 0) return '';
    return `${tempo} min`;
  };

  // Determinar se os ícones devem estar coloridos
  const shouldShowColoredIcons = quantidade > 0 && disponibilidadeFinal;

  // Função para determinar mensagem de status
  const getStatusMessage = () => {
    if (!restauranteDisponivel) {
      return "Restaurante indisponível";
    }
    if (!disponivel) {
      return "Temporariamente indisponível";
    }
    return null;
  };

  // Função para obter selos ativos (alinhada com estrutura da API)
  const getSelosAtivos = () => {    
    if (!selos || typeof selos !== 'object') {
      return [];
    }
    
    const selosAtivos = Object.entries(selos)
      .filter(([key, value]) => {
        // Filtrar apenas os selos válidos (não incluir produto_id)
        const isValidSelo = ['sem_lactose', 'sem_gluten', 'sem_amendoim', 'vegano'].includes(key);
        
        // Verificar se o selo está ativo (true)
        const isActive = value === true;
        
        return isValidSelo && isActive;
      })
      .map(([key, _]) => key);
    
    return selosAtivos;
  };

  // Obter lista de selos para exibir
  const selosParaExibir = getSelosAtivos();

  return (
    <View style={[
      styles.container, 
      !disponibilidadeFinal && styles.containerIndisponivel
    ]}>
      {/* Conteúdo principal */}
      <View style={styles.mainContent}>
        {/* Lado esquerdo - Informações do produto */}
        <View style={styles.infoContainer}>
          <Text style={[
            styles.nome, 
            !disponibilidadeFinal && styles.textoIndisponivel
          ]} numberOfLines={2}>
            {nome}
          </Text>
          <Text style={[
            styles.descricao, 
            !disponibilidadeFinal && styles.textoIndisponivel
          ]} numberOfLines={3}>
            {descricao}
          </Text>
          
          {/* Informações de preço */}
          <View style={styles.priceTimeContainer}>
            <Text style={[
              styles.valor, 
              !disponibilidadeFinal && styles.textoIndisponivel
            ]}>
              {formatarValor(valorFinal)}
            </Text>
          </View>

          {/* Status de disponibilidade */}
          {!disponibilidadeFinal && (
            <Text style={styles.statusIndisponivel}>
              {getStatusMessage()}
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
                    style={[
                      styles.seloIcon, 
                      !disponibilidadeFinal && styles.seloIndisponivel
                    ]}
                  />
                ) : null;
              })}
            </View>
          )}

          {/* Controles de quantidade */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPressIn={() => disponibilidadeFinal && setMenosPressionado(true)}
              onPressOut={() => setMenosPressionado(false)}
              onPress={handleMenos}
              style={[
                styles.quantityButton, 
                (quantidade === 0 || !disponibilidadeFinal) && styles.disabledButton
              ]}
              disabled={quantidade === 0 || !disponibilidadeFinal}
            >
              <MenosIcon 
                isPressed={shouldShowColoredIcons && (menosPressionado && quantidade > 0)} 
                width={24} 
                height={24} 
              />
            </TouchableOpacity>

            <Text style={[
              styles.quantityText, 
              !disponibilidadeFinal && styles.textoIndisponivel
            ]}>
              {quantidade}
            </Text>

            <TouchableOpacity
              onPressIn={() => disponibilidadeFinal && setMaisPressionado(true)}
              onPressOut={() => setMaisPressionado(false)}
              onPress={handleMais}
              style={[
                styles.quantityButton, 
                !disponibilidadeFinal && styles.disabledButton
              ]}
              disabled={!disponibilidadeFinal}
            >
              <MaisIcon 
                isPressed={shouldShowColoredIcons && maisPressionado} 
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
    backgroundColor: '#F5F5F5',
    borderColor: '#D0D0D0',
    opacity: 0.6,
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

  priceTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  valor: {
    fontSize: 14,
    fontFamily: 'Nunito-Medium',
    color: '#4E0777',
  },

  tempoPreparo: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#666666',
    fontStyle: 'italic',
  },

  statusIndisponivel: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#FF6B6B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  textoIndisponivel: {
    color: '#A0A0A0',
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
    opacity: 0.3, 
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
    opacity: 0.3, 
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