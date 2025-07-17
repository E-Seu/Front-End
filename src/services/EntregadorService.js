import axios from 'axios';
import RestaurantService from './RestaurantService';

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

class EntregadorService {
  // ✅ Cache para mapeamento usuario_id -> entregador_id
  static _idCache = new Map();

  // Método para normalizar dados do entregador
  static normalizeEntregadorData(entregador) {
    return {
      ...entregador,
      id: entregador.entregador_id,
      entregador_id: entregador.entregador_id,
      saldo: typeof entregador.saldo === 'string' ? parseFloat(entregador.saldo) : entregador.saldo
    };
  }

  // ✅ Buscar entregador por usuario_id
  static async getEntregadorByUsuarioId(usuarioId) {
    try {
      console.log(`🔄 Buscando entregador por usuario_id ${usuarioId}...`);
      const response = await apiClient.get(`/entregador/usuario/${usuarioId}`);
      const normalizedData = this.normalizeEntregadorData(response.data);
      
      // ✅ Salvar no cache
      this._idCache.set(usuarioId, normalizedData.entregador_id);
      
      console.log(`✅ Entregador encontrado por usuario_id ${usuarioId}:`, normalizedData);
      return normalizedData;
    } catch (error) {
      console.error(`❌ Erro ao buscar entregador por usuario_id ${usuarioId}:`, error.message);
      return null;
    }
  }

  // ✅ FUNÇÃO OTIMIZADA: Buscar dados do entregador
  static async getEntregador(usuarioId) {
    return await this.getEntregadorByUsuarioId(usuarioId);
  }

  // ✅ FUNÇÃO OTIMIZADA: Resolver ID do entregador
  static async resolverEntregadorId(usuarioId) {
    try {
      // ✅ Verificar cache primeiro
      if (this._idCache.has(usuarioId)) {
        const entregadorId = this._idCache.get(usuarioId);
        console.log(`✅ Entregador_id encontrado no cache: ${entregadorId} para usuario_id ${usuarioId}`);
        return entregadorId;
      }

      console.log(`🔄 Resolvendo entregador_id para usuario_id ${usuarioId}...`);
      
      // ✅ Buscar por usuario_id diretamente
      const entregador = await this.getEntregadorByUsuarioId(usuarioId);
      
      if (entregador) {
        console.log(`✅ Entregador_id resolvido: ${entregador.entregador_id} para usuario_id ${usuarioId}`);
        return entregador.entregador_id;
      }
      
      // ✅ Fallback: assumir que é entregador_id
      console.log(`⚠️ Não foi possível resolver entregador_id para usuario_id ${usuarioId}, usando o próprio ID`);
      return usuarioId;
    } catch (error) {
      console.error(`❌ Erro ao resolver entregador_id para usuario_id ${usuarioId}:`, error);
      return usuarioId;
    }
  }

  // ✅ Função para limpar cache (útil para logout)
  static clearCache() {
    this._idCache.clear();
    console.log('🗑️ Cache de IDs limpo');
  }

  // ✅ Atualizar disponibilidade (com resolução de ID)
  static async atualizarDisponibilidade(usuarioId, disponivel) {
    try {
      // Resolver o entregador_id
      const entregadorId = await this.resolverEntregadorId(usuarioId);
      
      console.log(`🔄 Atualizando disponibilidade do entregador ${entregadorId} para ${disponivel}...`);
      const response = await apiClient.put(`/entregador/${entregadorId}/disponivel?disponivel=${disponivel}`);
      console.log(`✅ Disponibilidade atualizada:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao atualizar disponibilidade:`, error.message);
      return null;
    }
  }

  // ✅ Buscar pedidos disponíveis
  static async buscarPedidosDisponiveis() {
    try {
      console.log('🔄 Buscando pedidos disponíveis...');
      const response = await apiClient.get('/pedido/disponiveis');
      console.log('✅ Pedidos disponíveis:', response.data);
      return response.data;
    } catch (error) {
      console.log('📦 Erro ao buscar pedidos disponíveis:', error.message);
      return [];
    }
  }

  // ✅ Aceitar pedido (com resolução de ID)
  static async aceitarPedido(usuarioId, pedidoId) {
    try {
      // Resolver o entregador_id
      const entregadorId = await this.resolverEntregadorId(usuarioId);
      
      console.log(`🔄 Entregador ${entregadorId} (usuario_id: ${usuarioId}) aceitando pedido ${pedidoId}...`);
      const response = await apiClient.put(`/entregador/${entregadorId}/aceitar_pedido/${pedidoId}`);
      console.log('✅ Pedido aceito:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao aceitar pedido:', error.message);
      
      if (error.response) {
        console.error('📡 Status do erro:', error.response.status);
        console.error('📡 Dados do erro:', error.response.data);
      }
      
      return null;
    }
  }

  // ✅ Rejeitar pedido (com resolução de ID)
  static async rejeitarPedido(usuarioId, pedidoId) {
    try {
      // Resolver o entregador_id
      const entregadorId = await this.resolverEntregadorId(usuarioId);
      
      console.log(`🔄 Entregador ${entregadorId} (usuario_id: ${usuarioId}) rejeitando pedido ${pedidoId}...`);
      const response = await apiClient.put(`/entregador/${entregadorId}/rejeitar_pedido/${pedidoId}`);
      console.log('✅ Pedido rejeitado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao rejeitar pedido:', error.message);
      
      if (error.response) {
        console.error('📡 Status do erro:', error.response.status);
        console.error('📡 Dados do erro:', error.response.data);
      }
      
      return null;
    }
  }

  // ✅ Entregar pedido (com resolução de ID)
  static async entregarPedido(usuarioId, pedidoId) {
    try {
      // Resolver o entregador_id
      const entregadorId = await this.resolverEntregadorId(usuarioId);
      
      console.log(`🔄 Entregador ${entregadorId} (usuario_id: ${usuarioId}) finalizando entrega do pedido ${pedidoId}...`);
      const response = await apiClient.put(`/entregador/${entregadorId}/entregar_pedido/${pedidoId}`);
      console.log('✅ Entrega finalizada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao finalizar entrega:', error.message);
      
      if (error.response) {
        console.error('📡 Status do erro:', error.response.status);
        console.error('📡 Dados do erro:', error.response.data);
      }
      
      return null;
    }
  }

  // ✅ Visualizar pedidos entregues (com resolução de ID)
  static async visualizarPedidosEntregues(usuarioId) {
    try {
      // Resolver o entregador_id
      const entregadorId = await this.resolverEntregadorId(usuarioId);
      
      console.log(`🔄 Buscando pedidos entregues do entregador ${entregadorId} (usuario_id: ${usuarioId})...`);
      const response = await apiClient.get(`/entregador/${entregadorId}/pedidos_entregues`);
      console.log('✅ Pedidos entregues:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos entregues:', error.message);
      
      if (error.response) {
        console.error('📡 Status do erro:', error.response.status);
        console.error('📡 Dados do erro:', error.response.data);
      }
      
      return [];
    }
  }

  // ✅ Visualizar pedido entregue específico (com resolução de ID)
  static async visualizarPedidoEntregue(usuarioId, pedidoId) {
    try {
      // Resolver o entregador_id
      const entregadorId = await this.resolverEntregadorId(usuarioId);
      
      console.log(`🔄 Buscando pedido entregue ${pedidoId} do entregador ${entregadorId} (usuario_id: ${usuarioId})...`);
      const response = await apiClient.get(`/entregador/${entregadorId}/pedido_entregue/${pedidoId}`);
      console.log('✅ Pedido entregue encontrado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar pedido entregue:', error.message);
      
      if (error.response) {
        console.error('📡 Status do erro:', error.response.status);
        console.error('📡 Dados do erro:', error.response.data);
      }
      
      return null;
    }
  }

  // ✅ Visualizar saldo do entregador (com resolução de ID)
  static async visualizarSaldoEntregador(usuarioId) {
    try {
      // Resolver o entregador_id
      const entregadorId = await this.resolverEntregadorId(usuarioId);
      
      console.log(`🔄 Buscando saldo do entregador ${entregadorId} (usuario_id: ${usuarioId})...`);
      const response = await apiClient.get(`/entregador/${entregadorId}/saldo`);
      console.log('✅ Saldo encontrado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar saldo:', error.message);
      
      if (error.response) {
        console.error('📡 Status do erro:', error.response.status);
        console.error('📡 Dados do erro:', error.response.data);
      }
      
      return null;
    }
  }

  // ✅ Atualizar saldo do entregador (com resolução de ID)
  static async atualizarSaldoEntregador(usuarioId, saldo) {
    try {
      // Resolver o entregador_id
      const entregadorId = await this.resolverEntregadorId(usuarioId);
      
      console.log(`🔄 Atualizando saldo do entregador ${entregadorId} (usuario_id: ${usuarioId}) para ${saldo}...`);
      
      // ✅ Enviar saldo como parâmetro da URL em vez de body
      const response = await apiClient.put(`/entregador/${entregadorId}/saldo?saldo=${saldo}`);
      console.log('✅ Saldo atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao atualizar saldo:', error.message);
      
      if (error.response) {
        console.error('📡 Status do erro:', error.response.status);
        console.error('📡 Dados do erro:', error.response.data);
      }
      
      return null;
    }
  }

  // ✅ Criar novo entregador
  static async criarEntregador(entregadorData) {
    try {
      console.log('🔄 Criando novo entregador:', entregadorData);
      const response = await apiClient.post('/entregador', entregadorData);
      console.log('✅ Entregador criado:', response.data);
      return this.normalizeEntregadorData(response.data);
    } catch (error) {
      console.error('❌ Erro ao criar entregador:', error.message);
      
      if (error.response) {
        console.error('📡 Status do erro:', error.response.status);
        console.error('📡 Dados do erro:', error.response.data);
      }
      
      throw error;
    }
  }

  // ✅ Calcular ganho do entregador (5% do valor total)
  static calcularGanhoEntregador(valorTotal) {
    const valor = parseFloat(valorTotal) || 0;
    return valor * 0.05; // 5% do total
  }

  // ✅ Calcular ganho do restaurante (95% do valor total)
  static calcularGanhoRestaurante(valorTotal) {
    const valor = parseFloat(valorTotal) || 0;
    return valor * 0.95; // 95% do total
  }

  // ✅ Processar entrega completa (entregar + atualizar saldo)
  static async processarEntregaCompleta(usuarioId, pedidoId, valorTotal, restauranteId) {
    try {
      // Resolver o entregador_id
      const entregadorId = await this.resolverEntregadorId(usuarioId);
      
      console.log(`🔄 Processando entrega completa: pedido ${pedidoId}, valor R$ ${valorTotal}...`);
      
      // 1. Entregar o pedido
      const resultadoEntrega = await this.entregarPedido(usuarioId, pedidoId);
      
      if (resultadoEntrega) {
        // 2. Calcular ganhos
        const ganhoEntregador = this.calcularGanhoEntregador(valorTotal); // 5% para entregador
        const ganhoRestaurante = valorTotal * 0.95; // 95% para restaurante
        
        // 3. Atualizar saldo do entregador
        const saldoAtualEntregador = await this.visualizarSaldoEntregador(usuarioId);
        const novoSaldoEntregador = (saldoAtualEntregador?.saldo || 0) + ganhoEntregador;
        await this.atualizarSaldoEntregador(usuarioId, novoSaldoEntregador);
        
        // 4. Atualizar saldo do restaurante
        if (restauranteId) {
          try {
            const saldoAtualRestaurante = await RestaurantService.getRestaurantBalance(restauranteId);
            const novoSaldoRestaurante = (saldoAtualRestaurante?.saldo || 0) + ganhoRestaurante;
            await RestaurantService.updateRestaurantBalance(restauranteId, novoSaldoRestaurante);
            console.log(`💰 Saldo do restaurante ${restauranteId} atualizado: +R$ ${ganhoRestaurante.toFixed(2)}`);
          } catch (error) {
            console.error('❌ Erro ao atualizar saldo do restaurante:', error);
          }
        }
        
        console.log(`✅ Entrega processada: Entregador +R$ ${ganhoEntregador.toFixed(2)}, Restaurante +R$ ${ganhoRestaurante.toFixed(2)}`);
        
        return {
          entrega: resultadoEntrega,
          ganhoEntregador: ganhoEntregador,
          ganhoRestaurante: ganhoRestaurante,
          novoSaldoEntregador: novoSaldoEntregador
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao processar entrega completa:', error);
      throw error;
    }
  }

  // ✅ Método para testar conexão com API
  static async testApiConnection() {
    try {
      console.log('🔍 Testando conexão com a API de entregadores...');
      const response = await apiClient.get('/entregador/1');
      console.log('✅ API de entregadores funcionando!');
      return { success: true, data: response.data };
    } catch (error) {
      console.log('❌ Erro de conexão com API de entregadores:', error.message);
      
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

export default EntregadorService;