import axios from 'axios';

const API_BASE_URL = 'http://10.0.2.2:8000'; // Android Emulator

// Configuração global do Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para logs automáticos
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('📦 Dados enviados:', config.data);
    }
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
    console.log('📡 Resposta recebida:', response.data);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - Erro:`, error.message);
    if (error.response) {
      console.error('📡 Status do erro:', error.response.status);
      console.error('📡 Detalhes do erro:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Mock data para fallback
const MOCK_CLIENTES = [
  { cliente_id: 1, usuario_id: 1, saldo: 200.00 },
  { cliente_id: 2, usuario_id: 2, saldo: 150.00 }
];

const MOCK_FAVORITOS = {
  1: [1, 2],
  2: [2]
};

const MOCK_RESTRICOES = {
  1: ["sem lactose"],
  2: []
};

class ClienteService {
  // Método para normalizar dados do cliente
  static normalizeClienteData(cliente) {
    return {
      ...cliente,
      id: cliente.cliente_id,
      cliente_id: cliente.cliente_id,
      saldo: typeof cliente.saldo === 'string' ? parseFloat(cliente.saldo) : cliente.saldo
    };
  }

  // ✅ Buscar dados do cliente
  static async getCliente(clienteId) {
    try {
      console.log(`🔄 Buscando cliente ${clienteId}...`);
      
      const response = await apiClient.get(`/clientes/${clienteId}`);
      const normalizedData = this.normalizeClienteData(response.data);
      
      console.log(`✅ Cliente ${clienteId} encontrado:`, normalizedData);
      return normalizedData;
    } catch (error) {
      console.log(`📦 Erro ao buscar cliente ${clienteId}:`, error.message);
      
      // Se for erro 404, retornar null
      if (error.response && error.response.status === 404) {
        console.log(`❌ Cliente ${clienteId} não encontrado na API`);
        return null;
      }
      
      // Para outros erros, usar fallback
      console.log(`📦 Usando fallback para cliente ${clienteId}`);
      const cliente = MOCK_CLIENTES.find(c => c.cliente_id === parseInt(clienteId));
      return cliente ? this.normalizeClienteData(cliente) : null;
    }
  }

    static async getNomeClientePorUsuarioId(usuarioId) {
    try {
      console.log(`🔄 Buscando nome do cliente pelo usuario_id ${usuarioId}...`);
      const response = await apiClient.get(`/usuario/${usuarioId}/nome`);
      console.log(`✅ Nome do cliente encontrado:`, response.data);
      return response.data.nome;
    } catch (error) {
      console.log(`📦 Erro ao buscar nome do cliente pelo usuario_id ${usuarioId}:`, error.message);
      return null;
    }
  }

  // ✅ Listar favoritos do cliente
  static async listarFavoritos(clienteId) {
    try {
      console.log(`🔄 Buscando favoritos do cliente ${clienteId}...`);
      
      const response = await apiClient.get(`/clientes/${clienteId}/favorito`);
      
      console.log(`✅ Favoritos do cliente ${clienteId}:`, response.data);
      return response.data;
    } catch (error) {
      console.log(`📦 Erro ao buscar favoritos do cliente ${clienteId}:`, error.message);
      
      // Fallback para mock
      return {
        cliente_id: parseInt(clienteId),
        favoritos: MOCK_FAVORITOS[parseInt(clienteId)] || []
      };
    }
  }

  // ✅ Visualizar saldo do cliente
  static async visualizarSaldo(clienteId) {
    try {
      console.log(`🔄 Buscando saldo do cliente ${clienteId}...`);
      
      const response = await apiClient.get(`/clientes/${clienteId}/saldo`);
      
      console.log(`✅ Saldo do cliente ${clienteId}:`, response.data);
      return response.data;
    } catch (error) {
      console.log(`📦 Erro ao buscar saldo do cliente ${clienteId}:`, error.message);
      
      // Se for erro 404, retornar null
      if (error.response && error.response.status === 404) {
        console.log(`❌ Cliente ${clienteId} não encontrado para buscar saldo`);
        return null;
      }
      
      // Para outros erros, usar fallback
      console.log(`📦 Usando fallback para saldo do cliente ${clienteId}`);
      const cliente = MOCK_CLIENTES.find(c => c.cliente_id === parseInt(clienteId));
      return cliente ? { cliente_id: parseInt(clienteId), saldo: cliente.saldo } : null;
    }
  }

  // ✅ Adicionar favorito
  static async adicionarFavorito(clienteId, restauranteId) {
    try {
      console.log(`🔄 Adicionando favorito: cliente ${clienteId}, restaurante ${restauranteId}...`);
      
      const response = await apiClient.post(`/clientes/${clienteId}/favorito/${restauranteId}`);
      
      console.log(`✅ Favorito adicionado:`, response.data);
      return response.data;
    } catch (error) {
      console.log(`📦 Erro ao adicionar favorito:`, error.message);
      
      // Fallback para mock
      if (!MOCK_FAVORITOS[parseInt(clienteId)]) {
        MOCK_FAVORITOS[parseInt(clienteId)] = [];
      }
      
      // Verificar se já existe para evitar duplicatas
      const restauranteIdInt = parseInt(restauranteId);
      if (!MOCK_FAVORITOS[parseInt(clienteId)].includes(restauranteIdInt)) {
        MOCK_FAVORITOS[parseInt(clienteId)].push(restauranteIdInt);
      }
      
      return {
        cliente_id: parseInt(clienteId),
        favoritos: MOCK_FAVORITOS[parseInt(clienteId)]
      };
    }
  }

  // ✅ Remover favorito
  static async removerFavorito(clienteId, restauranteId) {
    try {
      console.log(`🔄 Removendo favorito: cliente ${clienteId}, restaurante ${restauranteId}...`);
      
      const response = await apiClient.delete(`/clientes/${clienteId}/favorito/${restauranteId}`);
      
      console.log(`✅ Favorito removido:`, response.data);
      return response.data;
    } catch (error) {
      console.log(`📦 Erro ao remover favorito:`, error.message);
      
      // Se for erro 404, favorito não existe
      if (error.response && error.response.status === 404) {
        console.log(`❌ Favorito não encontrado para remover`);
        return {
          cliente_id: parseInt(clienteId),
          favoritos: MOCK_FAVORITOS[parseInt(clienteId)] || []
        };
      }
      
      // Fallback para mock
      if (MOCK_FAVORITOS[parseInt(clienteId)]) {
        const index = MOCK_FAVORITOS[parseInt(clienteId)].indexOf(parseInt(restauranteId));
        if (index > -1) {
          MOCK_FAVORITOS[parseInt(clienteId)].splice(index, 1);
        }
      }
      
      return {
        cliente_id: parseInt(clienteId),
        favoritos: MOCK_FAVORITOS[parseInt(clienteId)] || []
      };
    }
  }

  // ✅ Atualizar restrições (selos)
  static async atualizarRestricoes(clienteId, restricoes) {
    try {
      console.log(`🔄 Atualizando restrições do cliente ${clienteId}:`, restricoes);
      
      const response = await apiClient.put(`/clientes/${clienteId}/restricoes`, restricoes);
      
      console.log(`✅ Restrições atualizadas:`, response.data);
      return response.data;
    } catch (error) {
      console.log(`📦 Erro ao atualizar restrições:`, error.message);
      
      // Fallback para mock
      MOCK_RESTRICOES[parseInt(clienteId)] = restricoes;
      
      return {
        cliente_id: parseInt(clienteId),
        restricoes: restricoes
      };
    }
  }

  // ✅ Atualizar saldo
  static async atualizarSaldo(clienteId, saldo) {
    try {
      console.log(`🔄 Atualizando saldo do cliente ${clienteId} para ${saldo}...`);
      
      const response = await apiClient.put(`/clientes/${clienteId}/saldo`, null, {
        params: { saldo: parseFloat(saldo) }
      });
      
      console.log(`✅ Saldo atualizado:`, response.data);
      return response.data;
    } catch (error) {
      console.log(`📦 Erro ao atualizar saldo:`, error.message);
      
      // Se for erro 404, cliente não existe
      if (error.response && error.response.status === 404) {
        console.log(`❌ Cliente ${clienteId} não encontrado para atualizar saldo`);
        return null;
      }
      
      // Fallback para mock
      const cliente = MOCK_CLIENTES.find(c => c.cliente_id === parseInt(clienteId));
      if (cliente) {
        cliente.saldo = parseFloat(saldo);
        return { cliente_id: parseInt(clienteId), saldo: cliente.saldo };
      }
      return null;
    }
  }

  // ✅ Verificar se restaurante é favorito
  static async isFavorito(clienteId, restauranteId) {
    try {
      const favoritos = await this.listarFavoritos(clienteId);
      return favoritos.favoritos.includes(parseInt(restauranteId));
    } catch (error) {
      console.error('❌ Erro ao verificar favorito:', error);
      return false;
    }
  }

  // ✅ Buscar restrições/selos do cliente
  static async buscarRestricoes(clienteId) {
    try {
      console.log(`🔄 Buscando restrições do cliente ${clienteId}...`);
      
      // Como não tem endpoint específico para buscar restrições, usar mock
      return {
        cliente_id: parseInt(clienteId),
        restricoes: MOCK_RESTRICOES[parseInt(clienteId)] || []
      };
    } catch (error) {
      console.log(`📦 Erro ao buscar restrições:`, error.message);
      
      return {
        cliente_id: parseInt(clienteId),
        restricoes: []
      };
    }
  }

  // ✅ Validar se cliente existe
  static async validarCliente(clienteId) {
    try {
      const cliente = await this.getCliente(clienteId);
      return cliente !== null;
    } catch (error) {
      console.error('❌ Erro ao validar cliente:', error);
      return false;
    }
  }

  // ✅ Buscar dados do cliente
  static async getCliente(clienteId) {
    try {
      console.log(`🔄 Buscando cliente ${clienteId}...`);
      
      const response = await apiClient.get(`/clientes/${clienteId}`);
      const normalizedData = this.normalizeClienteData(response.data);
      
      console.log(`✅ Cliente ${clienteId} encontrado:`, normalizedData);
      return normalizedData;
    } catch (error) {
      console.log(`📦 Erro ao buscar cliente ${clienteId}:`, error.message);
      
      // Se for erro 404, retornar null
      if (error.response && error.response.status === 404) {
        console.log(`❌ Cliente ${clienteId} não encontrado na API`);
        return null;
      }
      
      // Para outros erros, usar fallback
      console.log(`📦 Usando fallback para cliente ${clienteId}`);
      const cliente = MOCK_CLIENTES.find(c => c.cliente_id === parseInt(clienteId));
      return cliente ? this.normalizeClienteData(cliente) : null;
    }
  }

  // ✅ Método para debug - listar todos os endpoints
  static async debugEndpoints() {
    console.log('🔍 Testando endpoints do ClienteService...');
    
    const clienteId = 1;
    const restauranteId = 1;
    
    try {
      console.log('1. Testando getCliente...');
      await this.getCliente(clienteId);
      
      console.log('2. Testando listarFavoritos...');
      await this.listarFavoritos(clienteId);
      
      console.log('3. Testando visualizarSaldo...');
      await this.visualizarSaldo(clienteId);
      
      console.log('4. Testando buscarRestricoes...');
      await this.buscarRestricoes(clienteId);
      
      console.log('5. Testando validarCliente...');
      await this.validarCliente(clienteId);
      
      console.log('6. Testando getDadosCompletos...');
      await this.getDadosCompletos(clienteId);
      
      console.log('✅ Todos os endpoints testados!');
    } catch (error) {
      console.error('❌ Erro nos testes:', error);
    }
  }

  // ✅ Método utilitário para configurar URL da API
  static setApiUrl(url) {
    apiClient.defaults.baseURL = url;
    console.log(`🔧 URL da API alterada para: ${url}`);
  }

  // ✅ Método para verificar status da API
  static async checkApiStatus() {
    try {
      const response = await apiClient.get('/');
      return { online: true, data: response.data };
    } catch (error) {
      return { online: false, error: error.message };
    }
  }
}

export default ClienteService;