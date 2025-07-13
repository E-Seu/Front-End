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
    console.log('📦 Dados enviados:', JSON.stringify(config.data, null, 2));
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
      console.error('📡 Detalhes do erro:', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

class PedidoService {
  // ✅ Cache local para pedidos (temporário - só enquanto app estiver rodando)
  static _pedidosCache = [];

  // Método para normalizar dados do pedido
  static normalizePedidoData(pedido) {
    return {
      ...pedido,
      id: pedido.pedido_id,
      pedido_id: pedido.pedido_id,
      // Converter preco_total para number se necessário
      preco_total: typeof pedido.preco_total === 'string' ? parseFloat(pedido.preco_total) : pedido.preco_total,
      // Garantir que data_hora seja string ISO
      data_hora: typeof pedido.data_hora === 'string' ? pedido.data_hora : new Date(pedido.data_hora).toISOString(),
      // Garantir que observacao seja string ou null
      observacao: pedido.observacao || null
    };
  }

  // Método de teste de conexão para pedidos
  static async testConnection() {
    try {
      console.log('🔍 Testando conexão com a API de pedidos...');
      
      // Tentar buscar histórico do usuário 1 como teste
      const response = await apiClient.get('/pedidos/historico/1');
      
      console.log('✅ API de pedidos funcionando! Dados brutos:', response.data);
      
      // Normalizar dados da API
      const normalizedData = response.data.map(pedido => this.normalizePedidoData(pedido));
      console.log('🔄 Dados normalizados:', normalizedData);
      
      return { success: true, data: normalizedData };
    } catch (error) {
      console.log('❌ Erro de conexão com API de pedidos:', error.message);
      
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

  // Acompanhar pedido específico
  static async acompanharPedido(pedidoId) {
    try {
      console.log(`🔄 Buscando pedido ${pedidoId}...`);
      
      const response = await apiClient.get(`/pedidos/${pedidoId}`);
      const normalizedData = this.normalizePedidoData(response.data);
      
      console.log(`✅ Pedido ${pedidoId} encontrado:`, normalizedData);
      return normalizedData;
    } catch (error) {
      console.log(`📦 Erro ao buscar pedido ${pedidoId}, tentando cache:`, error.message);
      
      // Tentar encontrar no cache
      const pedido = this._pedidosCache.find(p => p.pedido_id === parseInt(pedidoId));
      return pedido ? this.normalizePedidoData(pedido) : null;
    }
  }

  // Histórico de pedidos do usuário
  static async historicoPedidos(usuarioId) {
    try {
      console.log(`🔄 Buscando histórico para usuário ${usuarioId}...`);
      
      const response = await apiClient.get(`/pedidos/historico/${usuarioId}`);
      const normalizedData = response.data.map(pedido => this.normalizePedidoData(pedido));
      
      console.log(`✅ Histórico do usuário ${usuarioId} carregado:`, normalizedData.length, 'pedidos');
      return normalizedData;
    } catch (error) {
      console.log(`📦 Erro ao buscar histórico do usuário ${usuarioId}, usando cache:`, error.message);
      
      // Filtrar pedidos do cache para o usuário específico
      const pedidosDoUsuario = this._pedidosCache.filter(
        pedido => pedido.cliente_id === parseInt(usuarioId)
      );
      
      console.log('📦 Pedidos encontrados no cache:', pedidosDoUsuario.length);
      console.log('📦 Cache completo:', this._pedidosCache);
      
      return pedidosDoUsuario.map(pedido => this.normalizePedidoData(pedido));
    }
  }

  // Criar novo pedido
  static async criarPedido(pedidoData) {
    try {
      console.log('🔄 Criando pedido (dados recebidos):', JSON.stringify(pedidoData, null, 2));
      
      // Validar dados obrigatórios
      if (!pedidoData.cliente_id) {
        throw new Error('cliente_id é obrigatório');
      }
      if (!pedidoData.restaurante_id) {
        throw new Error('restaurante_id é obrigatório');
      }
      if (!pedidoData.localizacao) {
        throw new Error('localizacao é obrigatória');
      }
      
      // Estrutura esperada pela API seguindo o schema PedidoBase
      const apiPedidoData = {
        cliente_id: parseInt(pedidoData.cliente_id),
        restaurante_id: parseInt(pedidoData.restaurante_id),
        entregador_id: pedidoData.entregador_id ? parseInt(pedidoData.entregador_id) : null,
        status: pedidoData.status || "aguardando",
        preco_total: parseFloat(pedidoData.preco_total || 0),
        localizacao: String(pedidoData.localizacao),
        data_hora: new Date().toISOString(), // ✅ Sempre gerar nova data
        observacao: pedidoData.observacao ? String(pedidoData.observacao) : null
      };
      
      console.log('📦 Dados formatados para API:', JSON.stringify(apiPedidoData, null, 2));
      
      // Verificar se todos os campos obrigatórios estão presentes
      const requiredFields = ['cliente_id', 'restaurante_id', 'status', 'preco_total', 'localizacao', 'data_hora'];
      const missingFields = requiredFields.filter(field => 
        apiPedidoData[field] === undefined || apiPedidoData[field] === null || apiPedidoData[field] === ''
      );
      
      if (missingFields.length > 0) {
        console.error('❌ Campos obrigatórios ausentes:', missingFields);
        throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
      }
      
      try {
        // Tentar criar pedido na API
        const response = await apiClient.post('/pedidos', apiPedidoData);
        const normalizedData = this.normalizePedidoData(response.data);
        
        console.log('✅ Pedido criado com sucesso na API:', normalizedData);
        
        // Adicionar ao cache também
        this._pedidosCache.push(normalizedData);
        console.log('📦 Pedido adicionado ao cache. Total no cache:', this._pedidosCache.length);
        
        return normalizedData;
      } catch (apiError) {
        console.log('❌ Erro na API, salvando no cache local:', apiError.message);
        
        // Se a API falhar, salvar no cache local
        const novoPedido = {
          ...apiPedidoData,
          pedido_id: Date.now(), // ID temporário baseado no timestamp
          id: Date.now()
        };
        
        const normalizedData = this.normalizePedidoData(novoPedido);
        
        // Adicionar ao cache local
        this._pedidosCache.push(normalizedData);
        console.log('📦 Pedido adicionado ao cache local:', normalizedData);
        console.log('📦 Cache atual:', this._pedidosCache);
        
        return normalizedData;
      }
    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error.message);
      
      if (error.response) {
        console.error('📡 Status do erro:', error.response.status);
        console.error('📡 Dados do erro:', JSON.stringify(error.response.data, null, 2));
        
        // Tentar extrair detalhes do erro 422
        if (error.response.status === 422) {
          console.error('🔍 Erro de validação (422):', JSON.stringify(error.response.data, null, 2));
          
          // Mostrar campos que faltam
          if (error.response.data.detail) {
            error.response.data.detail.forEach(err => {
              console.error(`❌ Campo: ${err.loc.join('.')} - Erro: ${err.msg}`);
            });
          }
        }
      }
      
      throw error; // Re-throw para que o CartModal possa tratar
    }
  }

  // Atualizar status do pedido
  static async atualizarStatusPedido(pedidoId, novoStatus) {
    try {
      console.log(`🔄 Atualizando status do pedido ${pedidoId} para ${novoStatus}...`);
      
      // CORRIGIDO: Usar query parameter como no backend
      const response = await apiClient.put(`/pedidos/${pedidoId}/status?status=${novoStatus}`);
      
      console.log(`✅ Status do pedido ${pedidoId} atualizado:`, response.data);
      
      // Atualizar no cache também
      const pedidoIndex = this._pedidosCache.findIndex(p => p.pedido_id === parseInt(pedidoId));
      if (pedidoIndex !== -1) {
        this._pedidosCache[pedidoIndex].status = novoStatus;
        console.log('📦 Status atualizado no cache');
      }
      
      return response.data;
    } catch (error) {
      console.log(`📦 Erro ao atualizar status do pedido ${pedidoId}:`, error.message);
      
      // Fallback para cache
      const pedido = this._pedidosCache.find(p => p.pedido_id === parseInt(pedidoId));
      if (pedido) {
        pedido.status = novoStatus;
        console.log('📦 Status atualizado no cache local');
        return { pedido_id: pedidoId, novo_status: novoStatus };
      }
      return null;
    }
  }

  // Cancelar pedido
  static async cancelarPedido(pedidoId) {
    try {
      console.log(`🔄 Cancelando pedido ${pedidoId}...`);
      
      const response = await apiClient.put(`/pedidos/${pedidoId}/cancelar`);
      
      console.log(`✅ Pedido ${pedidoId} cancelado:`, response.data);
      
      // Atualizar no cache também
      const pedidoIndex = this._pedidosCache.findIndex(p => p.pedido_id === parseInt(pedidoId));
      if (pedidoIndex !== -1) {
        this._pedidosCache[pedidoIndex].status = "cancelado";
        console.log('📦 Status de cancelamento atualizado no cache');
      }
      
      return response.data;
    } catch (error) {
      console.log(`📦 Erro ao cancelar pedido ${pedidoId}:`, error.message);
      
      // Fallback para cache
      const pedido = this._pedidosCache.find(p => p.pedido_id === parseInt(pedidoId));
      if (pedido) {
        pedido.status = "cancelado";
        console.log('📦 Pedido cancelado no cache local');
        return { pedido_id: pedidoId, novo_status: "cancelado" };
      }
      return null;
    }
  }

  // Formatar data para exibição
  static formatarDataHora(dataHora) {
    try {
      const data = new Date(dataHora);
      
      // Verificar se a data é válida
      if (isNaN(data.getTime())) {
        console.warn('⚠️ Data inválida:', dataHora);
        return { data: 'Data inválida', hora: 'Hora inválida' };
      }
      
      const dataFormatada = data.toLocaleDateString('pt-BR');
      const horaFormatada = data.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return { data: dataFormatada, hora: horaFormatada };
    } catch (error) {
      console.error('❌ Erro ao formatar data:', error);
      return { data: 'Data inválida', hora: 'Hora inválida' };
    }
  }

  // Mapear status para português
  static mapearStatus(status) {
    const statusMap = {
      'aguardando': 'Aguardando',
      'em preparo': 'Em preparo',
      'pronto': 'Pronto',
      'a caminho': 'A caminho',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado',
      'concluido': 'Concluído'
    };
    return statusMap[status] || status;
  }

  // Verificar se o pedido está em andamento
  static isPedidoAtivo(status) {
    const statusAtivos = ['aguardando', 'em preparo', 'pronto', 'a caminho'];
    return statusAtivos.includes(status);
  }

  // Calcular tempo estimado baseado no status
  static calcularTempoEstimado(status, dataPedido) {
    try {
      const agora = new Date();
      const dataInicio = new Date(dataPedido);
      const tempoDecorrido = Math.floor((agora - dataInicio) / (1000 * 60)); // em minutos
      
      const temposPorStatus = {
        'aguardando': 5,
        'em preparo': 30,
        'pronto': 35,
        'a caminho': 45
      };
      
      const tempoTotal = temposPorStatus[status] || 0;
      const tempoRestante = Math.max(0, tempoTotal - tempoDecorrido);
      
      return {
        tempoRestante,
        tempoTotal,
        progresso: Math.min(100, (tempoDecorrido / tempoTotal) * 100)
      };
    } catch (error) {
      console.error('❌ Erro ao calcular tempo estimado:', error);
      return { tempoRestante: 0, tempoTotal: 0, progresso: 0 };
    }
  }

  // Buscar pedidos por restaurante (para proprietários)
  static async getPedidosByRestaurante(restauranteId) {
    try {
      console.log(`🔄 Buscando pedidos do restaurante ${restauranteId}...`);
      
      const response = await apiClient.get(`/restaurantes/${restauranteId}/pedidos`);
      const normalizedData = response.data.map(pedido => this.normalizePedidoData(pedido));
      
      console.log(`✅ Pedidos do restaurante ${restauranteId} carregados:`, normalizedData.length);
      return normalizedData;
    } catch (error) {
      console.log(`📦 Erro ao buscar pedidos do restaurante ${restauranteId}, usando cache:`, error.message);
      
      const pedidos = this._pedidosCache.filter(p => p.restaurante_id === parseInt(restauranteId));
      return pedidos.map(pedido => this.normalizePedidoData(pedido));
    }
  }

  // ✅ Método para limpar cache (útil para debug)
  static limparCache() {
    this._pedidosCache = [];
    console.log('🗑️ Cache de pedidos limpo');
  }

  // ✅ Método para ver cache (útil para debug)
  static verCache() {
    console.log('📦 Cache atual:', this._pedidosCache);
    return this._pedidosCache;
  }

  // ✅ Método para adicionar pedido ao cache manualmente (útil para testes)
  static adicionarAoCache(pedido) {
    const normalizedPedido = this.normalizePedidoData(pedido);
    this._pedidosCache.push(normalizedPedido);
    console.log('📦 Pedido adicionado manualmente ao cache:', normalizedPedido);
    return normalizedPedido;
  }

  // ✅ Método para remover pedido do cache
  static removerDoCache(pedidoId) {
    const index = this._pedidosCache.findIndex(p => p.pedido_id === parseInt(pedidoId));
    if (index !== -1) {
      const pedidoRemovido = this._pedidosCache.splice(index, 1)[0];
      console.log('📦 Pedido removido do cache:', pedidoRemovido);
      return pedidoRemovido;
    }
    return null;
  }

  // Método utilitário para configurar URL da API dinamicamente
  static setApiUrl(url) {
    apiClient.defaults.baseURL = url;
    console.log(`🔧 URL da API de pedidos alterada para: ${url}`);
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

export default PedidoService;