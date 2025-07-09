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

class RestaurantService {
  // Método para normalizar dados do restaurante
  static normalizeRestaurantData(restaurant) {
    return {
      ...restaurant,
      id: restaurant.restaurante_id,
      restaurante_id: restaurant.restaurante_id,
      localizacao: restaurant.local,
      avaliacao: restaurant.numero_estrelas,
      saldo: typeof restaurant.saldo === 'string' ? parseFloat(restaurant.saldo) : restaurant.saldo
    };
  }

  // Método de teste de conexão
  static async testConnection() {
    try {
      console.log('🔍 Testando conexão com a API...');
      
      const response = await apiClient.get('/restaurantes');
      
      console.log('✅ API funcionando! Dados brutos:', response.data);
      
      // Normalizar dados da API
      const normalizedData = response.data.map(restaurant => this.normalizeRestaurantData(restaurant));
      console.log('🔄 Dados normalizados:', normalizedData);
      
      return { success: true, data: normalizedData };
    } catch (error) {
      console.log('❌ Erro de conexão:', error.message);
      
      if (error.code === 'ECONNABORTED') {
        console.log('⏰ Timeout na conexão');
      } else if (error.code === 'NETWORK_ERROR') {
        console.log('🌐 Erro de rede');
      } else if (error.response) {
        console.log('📡 Resposta da API:', error.response.status, error.response.data);
      }
      
      return { success: false, error: error.message };
    }
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
      
      // Normalizar produtos
      const normalizedProducts = response.data.map(product => ({
        ...product,
        id: product.produto_id || product.id,
        produto_id: product.produto_id || product.id,
        valor: typeof product.valor === 'string' ? parseFloat(product.valor) : product.valor,
        disponivel: product.disponivel !== undefined ? product.disponivel : true
      }));
      
      console.log(`✅ ${normalizedProducts.length} produtos encontrados`);
      return normalizedProducts;
    } catch (error) {
      console.log(`📦 Erro ao buscar produtos do restaurante ${restaurantId}:`, error.message);
      return [];
    }
  }

  // Atualizar status do restaurante
  static async updateRestaurantStatus(id, disponivel) {
    try {
      console.log(`🔄 Atualizando status do restaurante ${id} para ${disponivel}...`);
      
      const response = await apiClient.put(`/restaurantes/${id}/disponivel`, null, {
        params: { disponivel }
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

  // Adicionar produto ao restaurante
  static async addProduct(restaurantId, productData) {
    try {
      console.log(`🔄 Adicionando produto ao restaurante ${restaurantId}:`, productData);
      
      const response = await apiClient.post(`/restaurantes/${restaurantId}/produto`, productData);
      
      console.log(`✅ Produto adicionado ao restaurante ${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao adicionar produto ao restaurante ${restaurantId}:`, error.message);
      
      if (error.response) {
        console.error('📡 Detalhes do erro:', error.response.data);
      }
      
      return null;
    }
  }

  // Atualizar produto
  static async updateProduct(restaurantId, productId, productData) {
    try {
      console.log(`🔄 Atualizando produto ${productId} do restaurante ${restaurantId}:`, productData);
      
      const response = await apiClient.put(`/restaurantes/${restaurantId}/produto/${productId}`, productData);
      
      console.log(`✅ Produto ${productId} atualizado`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao atualizar produto ${productId}:`, error.message);
      
      if (error.response) {
        console.error('📡 Detalhes do erro:', error.response.data);
      }
      
      return null;
    }
  }

  // Atualizar disponibilidade do produto
  static async updateProductAvailability(restaurantId, productId, disponivel) {
    try {
      console.log(`🔄 Atualizando disponibilidade do produto ${productId} para ${disponivel}...`);
      
      const response = await apiClient.put(`/restaurantes/${restaurantId}/produto/${productId}/disponivel`, null, {
        params: { disponivel }
      });
      
      console.log(`✅ Disponibilidade do produto ${productId} atualizada`);
      return response.data;
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
      
      await apiClient.delete(`/restaurante/${restaurantId}/produto/${productId}`);
      
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
      
      const response = await apiClient.put(`/restaurante/${restaurantId}/saldo`, null, {
        params: { saldo }
      });
      
      console.log(`✅ Saldo do restaurante ${restaurantId} atualizado`);
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