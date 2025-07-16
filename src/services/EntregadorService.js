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

// Mock data para entregadores
const MOCK_ENTREGADORES = [
  {
    entregador_id: 1,
    usuario_id: 3,
    disponivel: true,
    veiculo: "moto",
    localizacao_atual: "Centro",
    saldo: 150.00
  }
];

class EntregadorService {
  // Método para normalizar dados do entregador
  static normalizeEntregadorData(entregador) {
    return {
      ...entregador,
      id: entregador.entregador_id,
      entregador_id: entregador.entregador_id,
      saldo: typeof entregador.saldo === 'string' ? parseFloat(entregador.saldo) : entregador.saldo
    };
  }

  // Buscar dados do entregador
  static async getEntregador(entregadorId) {
    try {
      console.log(`🔄 Buscando entregador ${entregadorId}...`);
      const response = await apiClient.get(`/entregador/${entregadorId}`);
      const normalizedData = this.normalizeEntregadorData(response.data);
      console.log(`✅ Entregador ${entregadorId} encontrado:`, normalizedData);
      return normalizedData;
    } catch (error) {
      console.log(`📦 Erro ao buscar entregador ${entregadorId}, usando mock:`, error.message);
      const entregador = MOCK_ENTREGADORES.find(e => e.entregador_id === parseInt(entregadorId));
      return entregador ? this.normalizeEntregadorData(entregador) : null;
    }
  }

  // Atualizar disponibilidade
  static async atualizarDisponibilidade(entregadorId, disponivel) {
    try {
      console.log(`🔄 Atualizando disponibilidade do entregador ${entregadorId} para ${disponivel}...`);
      const response = await apiClient.put(`/entregador/${entregadorId}/disponivel?disponivel=${disponivel}`);
      console.log(`✅ Disponibilidade atualizada:`, response.data);
      return response.data;
    } catch (error) {
      console.log(`📦 Erro ao atualizar disponibilidade, usando mock:`, error.message);
      // Fallback para mock
      const entregador = MOCK_ENTREGADORES.find(e => e.entregador_id === parseInt(entregadorId));
      if (entregador) {
        entregador.disponivel = disponivel;
        return { entregador_id: parseInt(entregadorId), disponivel: entregador.disponivel };
      }
      return null;
    }
  }

  // Buscar pedidos disponíveis
  static async buscarPedidosDisponiveis() {
    try {
      console.log('🔄 Buscando pedidos disponíveis...');
      // Corrigido para o endpoint da sua API
      const response = await apiClient.get('/pedido/disponiveis');
      console.log('✅ Pedidos disponíveis:', response.data);
      return response.data;
    } catch (error) {
      console.log('📦 Erro ao buscar pedidos disponíveis:', error.message);
      return [];
    }
  }

  // Aceitar pedido (usando PUT conforme nova rota)
  static async aceitarPedido(entregadorId, pedidoId) {
    try {
      console.log(`🔄 Entregador ${entregadorId} aceitando pedido ${pedidoId}...`);
      const response = await apiClient.put(`/entregador/${entregadorId}/aceitar_pedido/${pedidoId}`);
      console.log('✅ Pedido aceito:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao aceitar pedido:', error.message);
      return null;
    }
  }

    static async rejeitarPedido(entregadorId, pedidoId) {
    try {
      console.log(`🔄 Entregador ${entregadorId} rejeitando pedido ${pedidoId}...`);
      const response = await apiClient.put(`/entregador/${entregadorId}/rejeitar_pedido/${pedidoId}`);
      console.log('✅ Pedido rejeitado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao rejeitar pedido:', error.message);
      return null;
    }
  }

    static async entregarPedido(entregadorId, pedidoId) {
    try {
      console.log(`🔄 Entregador ${entregadorId} finalizando entrega do pedido ${pedidoId}...`);
      const response = await apiClient.put(`/entregador/${entregadorId}/entregar_pedido/${pedidoId}`);
      console.log('✅ Entrega finalizada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao finalizar entrega:', error.message);
      return null;
    }
  }

  static async visualizarPedidosEntregues(entregadorId) {
    try {
      console.log(`🔄 Buscando pedidos entregues do entregador ${entregadorId}...`);
      const response = await apiClient.get(`/entregador/${entregadorId}/pedidos_entregues`);
      console.log('✅ Pedidos entregues:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos entregues:', error.message);
      return [];
    }
  }

    static async visualizarPedidoEntregue(entregadorId, pedidoId) {
    try {
      console.log(`🔄 Buscando pedido entregue ${pedidoId} do entregador ${entregadorId}...`);
      const response = await apiClient.get(`/entregador/${entregadorId}/pedido_entregue/${pedidoId}`);
      console.log('✅ Pedido entregue encontrado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar pedido entregue:', error.message);
      return null;
    }
  }

  // Método utilitário para configurar URL da API
  static setApiUrl(url) {
    apiClient.defaults.baseURL = url;
    console.log(`🔧 URL da API alterada para: ${url}`);
  }
}

export default EntregadorService;