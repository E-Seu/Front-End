import axios from 'axios';

const API_BASE_URL = 'http://10.0.2.2:8000'; // Android Emulator

// Configuração global do Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para logs automáticos
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - Erro:`, error.message);
    return Promise.reject(error);
  }
);

// Mock data atualizado com os campos corretos da API
const MOCK_RESTAURANTS = [
  {
    nome: "Comida Paixão - Feito com amor",
    info: "Restaurante especializado em comida caseira",
    local: "PPGCC",
    email: "restaurante@email.com",
    horario_abertura: "07:00",
    horario_fechamento: "18:00",
    numero_estrelas: 5.0,
    disponivel: true,
    telefone: "(85) 99999-1234",
    tipo_restaurante: "Comida Caseira",
    saldo: "1250.75",
    restaurante_id: 1,
    usuario_id: 1
  }
];

// Mock data para produtos (mesma estrutura do backend)
const MOCK_PRODUCTS = [
  {
    produto_id: 1,
    restaurante_id: 1,
    nome: "Feijoada Especial",
    descricao: "Feijoada completa com arroz, couve, farofa e torresmo",
    preco: 49.90,
    tempo_preparo: 40,
    disponivel: true,
    selos: {
      produto_id: 1,
      sem_lactose: false,
      sem_gluten: true,
      sem_amendoim: true,
      vegano: false
    }
  }
];

class RestaurantService {
  // Método para normalizar dados do restaurante
  static normalizeRestaurantData(restaurant) {
    return {
      ...restaurant,
      id: restaurant.restaurante_id || restaurant.id,
      restaurante_id: restaurant.restaurante_id || restaurant.id,
      localizacao: restaurant.local || restaurant.localizacao,
      numero_estrelas: Number(restaurant.numero_estrelas) || 0,
      avaliacao: Number(restaurant.numero_estrelas) || 0,
      saldo: typeof restaurant.saldo === 'string' ? parseFloat(restaurant.saldo) : (restaurant.saldo || 0)
    };
  }

  // Método para normalizar dados do produto
  static normalizeProductData(product) {
    let valorNormalizado;
    
    const precoFromApi = product.preco || product.valor; // Tentar ambos para compatibilidade
    
    if (precoFromApi === null || precoFromApi === undefined) {
      valorNormalizado = 0;
    } else if (typeof precoFromApi === 'string') {
      valorNormalizado = parseFloat(precoFromApi);
    } else if (typeof precoFromApi === 'number') {
      valorNormalizado = precoFromApi;
    } else if (typeof precoFromApi === 'object' && precoFromApi !== null) {
      // Para Decimal do Python/FastAPI
      valorNormalizado = parseFloat(precoFromApi.toString());
    } else {
      valorNormalizado = 0;
    }
    
    // Verificar se a conversão foi bem-sucedida
    if (isNaN(valorNormalizado)) {
      valorNormalizado = 0;
    }
    
    const normalized = {
      ...product,
      id: product.produto_id,
      produto_id: product.produto_id,
      valor: valorNormalizado,
      preco: valorNormalizado, // Manter ambos para compatibilidade
      // Garantir que disponivel seja boolean
      disponivel: product.disponivel !== undefined ? product.disponivel : true,
      // Garantir que selos seja objeto
      selos: product.selos || {},
      // Garantir que tempo_preparo seja number
      tempo_preparo: parseInt(product.tempo_preparo) || 30
    };
    
    return normalized;
  }

  // Buscar todos os restaurantes
  static async getAllRestaurants() {
    try {
      console.log('🔄 Buscando todos os restaurantes...');
      
      const response = await apiClient.get('/restaurantes');
      const normalizedData = response.data.map(restaurant => this.normalizeRestaurantData(restaurant));
      
      console.log('✅ Restaurantes carregados da API:', normalizedData.length);
      return normalizedData;
    } catch (error) {
      console.log('📦 Erro ao buscar restaurantes, usando dados mock:', error.message);
      return MOCK_RESTAURANTS.map(restaurant => this.normalizeRestaurantData(restaurant));
    }
  }

  static async getDadosCompletos(userId) {
    try {
      console.log(`🔄 Buscando dados completos para usuário ${userId}...`);
      
      // Buscar todos os restaurantes
      const allRestaurants = await this.getAllRestaurants();
      
      // Filtrar restaurantes pelo usuário
      const userRestaurants = allRestaurants.filter(r => r.usuario_id === parseInt(userId));
      
      if (userRestaurants.length > 0) {
        const restaurant = userRestaurants[0]; // Pegar o primeiro restaurante do usuário
        
        // Buscar saldo atualizado (sem falhar se não conseguir)
        let saldoAtualizado = restaurant.saldo;
        try {
          const saldoData = await this.getRestaurantBalance(restaurant.restaurante_id);
          if (saldoData) {
            saldoAtualizado = saldoData.saldo;
          }
        } catch (saldoError) {
          console.log('⚠️ Erro ao buscar saldo, usando saldo do restaurante:', saldoError.message);
        }
        
        const dadosCompletos = {
          ...restaurant,
          saldo: saldoAtualizado,
          // Garantir que os campos existem
          telefone: restaurant.telefone || null,
          local: restaurant.local || restaurant.localizacao || null,
          localizacao: restaurant.local || restaurant.localizacao || null
        };
        
        console.log(`✅ Dados completos encontrados:`, dadosCompletos);
        return dadosCompletos;
      }
      
      console.log(`⚠️ Nenhum restaurante encontrado para usuário ${userId}`);
      return null;
    } catch (error) {
      console.error(`❌ Erro ao buscar dados completos do usuário ${userId}:`, error.message);
      
      // Fallback para dados mock
      const restaurant = MOCK_RESTAURANTS.find(r => r.usuario_id === parseInt(userId));
      if (restaurant) {
        return this.normalizeRestaurantData(restaurant);
      }
      
      return null;
    }
  }

  // Buscar restaurante por ID
  static async getRestaurantById(id) {
    try {
      console.log(`🔄 Buscando restaurante ID ${id}...`);
      
      const response = await apiClient.get(`/restaurantes/${id}`);
      const normalizedData = this.normalizeRestaurantData(response.data);
      
      console.log(`✅ Restaurante ${id} encontrado:`, normalizedData);
      return normalizedData;
    } catch (error) {
      console.log(`📦 Erro ao buscar restaurante ${id}, usando mock:`, error.message);
      
      const restaurant = MOCK_RESTAURANTS.find(r => r.restaurante_id === parseInt(id));
      return restaurant ? this.normalizeRestaurantData(restaurant) : null;
    }
  }

  // Buscar restaurantes por usuário
  static async getRestaurantsByUser(userEmail) {
    try {
      console.log(`🔄 Buscando restaurantes para usuário: ${userEmail}`);
      
      const allRestaurants = await this.getAllRestaurants();
      const userRestaurants = allRestaurants.filter(r => r.email === userEmail);
      
      console.log(`🎯 Encontrados ${userRestaurants.length} restaurantes para ${userEmail}`);
      return userRestaurants;
    } catch (error) {
      console.error('❌ Erro ao buscar restaurantes do usuário:', error);
      return [];
    }
  }

  // Buscar produtos de um restaurante
  static async getProductsByRestaurant(restaurantId) {
    try {
      console.log(`🔄 Buscando produtos do restaurante ${restaurantId}...`);
      
      const response = await apiClient.get(`/restaurantes/${restaurantId}/produtos`);
      
      console.log(`✅ Produtos da API (dados brutos):`, response.data);
      
      // Normalizar produtos
      const normalizedProducts = response.data.map(product => this.normalizeProductData(product));
      console.log(`🔄 Produtos normalizados:`, normalizedProducts);
      
      return normalizedProducts;
    } catch (error) {
      console.log(`📦 Erro ao buscar produtos (${error.message}), usando mock`);
      // Fallback para produtos mock do restaurante específico
      const products = MOCK_PRODUCTS.filter(p => p.restaurante_id === parseInt(restaurantId));
      return products.map(product => this.normalizeProductData(product));
    }
  }

  static async addProduct(restaurantId, productData) {
    try {
      console.log(`🔄 Adicionando produto ao restaurante ${restaurantId}:`, productData);
      
      const precoValue = productData.preco || productData.valor || 0;
      
      if (precoValue <= 0) {
        throw new Error('Preço deve ser maior que zero');
      }
      
      const apiProductData = {
        nome: productData.nome,
        descricao: productData.descricao,
        preco: precoValue, 
        tempo_preparo: productData.tempo_preparo || 30,
        disponivel: productData.disponivel !== undefined ? productData.disponivel : true,
        selos: productData.selos || {
          sem_lactose: false,
          sem_gluten: false,
          sem_amendoim: false,
          vegano: false
        }
      };
      
      console.log('📦 Dados formatados para API:', apiProductData);
      
      const response = await apiClient.post(`/restaurantes/${restaurantId}/produto`, apiProductData);
      
      console.log(`✅ Produto adicionado:`, response.data);
      return this.normalizeProductData(response.data);
    } catch (error) {
      console.error(`❌ Erro ao adicionar produto ao restaurante ${restaurantId}:`, error.message);
      
      if (error.response) {
        console.error('📡 Detalhes do erro:', error.response.data);
      }
      
      throw error;
    }
  }

  // Atualizar produto
  static async updateProduct(restaurantId, productId, productData) {
    try {
      console.log(`🔄 Atualizando produto ${productId} do restaurante ${restaurantId}:`, productData);
      
      const precoValue = productData.preco || productData.valor || 0;
      
      if (precoValue <= 0) {
        throw new Error('Preço deve ser maior que zero');
      }
      
      const apiProductData = {
        nome: productData.nome,
        descricao: productData.descricao,
        preco: precoValue,
        tempo_preparo: productData.tempo_preparo || 30,
        disponivel: productData.disponivel !== undefined ? productData.disponivel : true,
        selos: productData.selos || {
          sem_lactose: false,
          sem_gluten: false,
          sem_amendoim: false,
          vegano: false
        }
      };
      
      const response = await apiClient.put(`/restaurantes/${restaurantId}/produto/${productId}`, apiProductData);
      
      console.log(`✅ Produto ${productId} atualizado:`, response.data);
      return this.normalizeProductData(response.data);
    } catch (error) {
      console.error(`❌ Erro ao atualizar produto ${productId}:`, error.message);
      
      if (error.response) {
        console.error('📡 Detalhes do erro:', error.response.data);
      }
      
      throw error; 
    }
  }

  // Atualizar status do restaurante
  static async updateRestaurantStatus(id, disponivel) {
    try {
      console.log(`🔄 Atualizando status do restaurante ${id} para ${disponivel}...`);
      
      const response = await apiClient.put(`/restaurantes/${id}/disponivel`, {
        disponivel: disponivel
      });
      
      const normalizedData = this.normalizeRestaurantData(response.data);
      console.log(`✅ Status do restaurante ${id} atualizado`);
      return normalizedData;
    } catch (error) {
      console.log(`📦 Erro ao atualizar status do restaurante ${id}:`, error.message);
      
      // Fallback para mock
      const restaurant = MOCK_RESTAURANTS.find(r => r.restaurante_id === parseInt(id));
      if (restaurant) {
        restaurant.disponivel = disponivel;
        return this.normalizeRestaurantData(restaurant);
      }
      return null;
    }
  }

  // Atualizar disponibilidade do produto
  static async updateProductAvailability(restaurantId, productId, disponivel) {
    try {
      console.log(`🔄 Atualizando disponibilidade do produto ${productId} para ${disponivel}...`);
      
      const response = await apiClient.put(`/restaurantes/${restaurantId}/produto/${productId}/disponivel`, {
        disponivel: disponivel
      });
      
      console.log(`✅ Disponibilidade do produto ${productId} atualizada:`, response.data);
      return this.normalizeProductData(response.data);
    } catch (error) {
      console.error(`❌ Erro ao atualizar disponibilidade do produto ${productId}:`, error.message);
      
      if (error.response) {
        console.error('📡 Detalhes do erro:', error.response.data);
      }
      
      return null;
    }
  }

  // Remover produto
  static async deleteProduct(restaurantId, productId) {
    try {
      console.log(`🔄 Removendo produto ${productId} do restaurante ${restaurantId}...`);
      
      const response = await apiClient.delete(`/restaurante/${restaurantId}/produto/${productId}`);
      
      console.log(`✅ Produto ${productId} removido com sucesso`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao remover produto ${productId}:`, error.message);
      
      if (error.response) {
        console.error('📡 Detalhes do erro:', error.response.data);
      }
      
      return false;
    }
  }

  // Buscar saldo do restaurante
  static async getRestaurantBalance(restaurantId) {
    try {
      console.log(`🔄 Buscando saldo do restaurante ${restaurantId}...`);
      
      const response = await apiClient.get(`/restaurantes/${restaurantId}/saldo`);
      
      console.log(`✅ Saldo do restaurante ${restaurantId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao buscar saldo do restaurante ${restaurantId}:`, error.message);
      return null;
    }
  }

  // Atualizar saldo do restaurante
  static async updateRestaurantBalance(restaurantId, saldo) {
    try {
      console.log(`🔄 Atualizando saldo do restaurante ${restaurantId} para ${saldo}...`);
      
      const response = await apiClient.put(`/restaurante/${restaurantId}/saldo?saldo=${saldo}`);
      
      console.log(`✅ Saldo do restaurante ${restaurantId} atualizado:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao atualizar saldo do restaurante ${restaurantId}:`, error.message);
      
      if (error.response) {
        console.error('📡 Detalhes do erro:', error.response.data);
      }
      
      return null;
    }
  }

  // Método utilitário para configurar URL da API dinamicamente
  static setApiUrl(url) {
    apiClient.defaults.baseURL = url;
    console.log(`🔧 URL da API alterada para: ${url}`);
  }

  // Método para verificar status da API
  static async checkApiStatus() {
    try {
      const response = await apiClient.get('/');
      return { online: true, data: response.data };
    } catch (error) {
      return { online: false, error: error.message };
    }
  }
}

export default RestaurantService;