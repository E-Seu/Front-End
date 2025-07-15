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

  // ✅ NOVA FUNÇÃO: Encontrar pedido ativo mais recente
  static encontrarPedidoAtual(pedidos) {
    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      console.log('📦 Nenhum pedido fornecido para buscar pedido atual');
      return null;
    }

    // Filtrar apenas pedidos ativos
    const pedidosAtivos = pedidos.filter(pedido => {
      const isAtivo = this.isPedidoAtivo(pedido.status);
      console.log(`📦 Pedido ${pedido.pedido_id} - Status: ${pedido.status} - Ativo: ${isAtivo}`);
      return isAtivo;
    });
    
    console.log(`📦 Total de pedidos ativos encontrados: ${pedidosAtivos.length}`);
    
    if (pedidosAtivos.length === 0) {
      console.log('📦 Nenhum pedido ativo encontrado');
      return null;
    }

    // Ordenar por data mais recente e retornar o primeiro
    const pedidoMaisRecente = pedidosAtivos.sort((a, b) => 
      new Date(b.data_hora) - new Date(a.data_hora)
    )[0];

    console.log('📦 Pedido ativo mais recente encontrado:', {
      pedido_id: pedidoMaisRecente.pedido_id,
      status: pedidoMaisRecente.status,
      data_hora: pedidoMaisRecente.data_hora
    });
    
    return pedidoMaisRecente;
  }

  // ✅ NOVA FUNÇÃO: Verificar se cliente tem pedido ativo
  static async clienteTemPedidoAtivo(clienteId) {
    try {
      console.log(`🔄 Verificando se cliente ${clienteId} tem pedido ativo...`);
      
      const pedidos = await this.listarPedidosCliente(clienteId);
      const pedidoAtivo = this.encontrarPedidoAtual(pedidos);
      
      const resultado = {
        temPedidoAtivo: pedidoAtivo !== null,
        pedidoAtivo: pedidoAtivo
      };
      
      console.log(`✅ Cliente ${clienteId} tem pedido ativo:`, resultado.temPedidoAtivo);
      
      return resultado;
    } catch (error) {
      console.error('❌ Erro ao verificar pedido ativo:', error);
      return {
        temPedidoAtivo: false,
        pedidoAtivo: null
      };
    }
  }

  // ✅ NOVA FUNÇÃO: Função para obter rótulo do status
  static getStatusLabel(status) {
    const statusLabels = {
      'aguardando': 'Aguardando',
      'em_preparo': 'Em preparo', 
      'pronto': 'Pronto',
      'a_caminho': 'A caminho',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado'
    };
    return statusLabels[status] || status;
  }

  // ✅ NOVA FUNÇÃO: Filtrar pedidos por tipo
  static filtrarPedidosPorTipo(pedidos, tipo = 'todos') {
    if (!Array.isArray(pedidos)) {
      console.warn('⚠️ Pedidos fornecidos não são um array:', pedidos);
      return [];
    }

    switch (tipo) {
      case 'ativos':
        return pedidos.filter(pedido => this.isPedidoAtivo(pedido.status));
      case 'historico':
        return pedidos.filter(pedido => pedido.status === 'entregue' || pedido.status === 'cancelado');
      case 'entregues':
        return pedidos.filter(pedido => pedido.status === 'entregue');
      case 'cancelados':
        return pedidos.filter(pedido => pedido.status === 'cancelado');
      default:
        return pedidos;
    }
  }

  static async listarPedidosCliente(clienteId) {
    try {
      console.log(`🔄 Buscando pedidos do cliente ${clienteId}...`);
      
      const response = await apiClient.get(`/pedidos/historico/${clienteId}`);
      const normalizedData = response.data.map(pedido => this.normalizePedidoData(pedido));
      
      console.log(`✅ Pedidos do cliente ${clienteId} carregados:`, normalizedData.length, 'pedidos');
      
      // Atualizar cache
      this._pedidosCache = normalizedData;
      
      return normalizedData;
    } catch (error) {
      console.log(`📦 Erro ao buscar pedidos do cliente ${clienteId}, usando cache:`, error.message);
      
      // Filtrar pedidos do cache para o cliente específico
      const pedidosDoCliente = this._pedidosCache.filter(
        pedido => pedido.cliente_id === parseInt(clienteId)
      );
      
      console.log('📦 Pedidos encontrados no cache:', pedidosDoCliente.length);
      
      return pedidosDoCliente;
    }
  }

  static async buscarPedido(pedidoId) {
    try {
      console.log(`🔄 Buscando pedido ${pedidoId}...`);
      
      // ✅ Usar rota correta da API: GET /pedidos/{id}
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

  // Acompanhar pedido específico (mantém nome original para compatibilidade)
  static async acompanharPedido(pedidoId) {
    return this.buscarPedido(pedidoId);
  }

  // Histórico de pedidos do usuário (mantém nome original para compatibilidade)
  static async historicoPedidos(usuarioId) {
    return this.listarPedidosCliente(usuarioId);
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
      
      // Estrutura correta para API FastAPI usando PedidoBase
      const apiPedidoData = {
        cliente_id: parseInt(pedidoData.cliente_id),
        restaurante_id: parseInt(pedidoData.restaurante_id),
        entregador_id: pedidoData.entregador_id ? parseInt(pedidoData.entregador_id) : null,
        status: pedidoData.status || "aguardando",
        preco_total: parseFloat(pedidoData.preco_total || 0).toFixed(2),
        localizacao: String(pedidoData.localizacao),
        data_hora: new Date().toISOString(),
        observacao: pedidoData.observacao ? String(pedidoData.observacao) : null
      };
      
      console.log('📦 Dados formatados para API:', JSON.stringify(apiPedidoData, null, 2));
      
      // Verificar se todos os campos obrigatórios estão presentes
      const requiredFields = ['cliente_id', 'restaurante_id', 'status', 'preco_total', 'localizacao', 'data_hora'];
      const missingFields = requiredFields.filter(field => 
        apiPedidoData[field] === undefined || 
        apiPedidoData[field] === null || 
        apiPedidoData[field] === '' ||
        (field === 'preco_total' && parseFloat(apiPedidoData[field]) < 0)
      );
      
      if (missingFields.length > 0) {
        console.error('❌ Campos obrigatórios ausentes/inválidos:', missingFields);
        throw new Error(`Campos obrigatórios ausentes/inválidos: ${missingFields.join(', ')}`);
      }
      
      try {
        // Tentar criar pedido na API usando POST /pedidos
        const response = await apiClient.post('/pedidos', apiPedidoData);
        const normalizedData = this.normalizePedidoData(response.data);
        
        console.log('✅ Pedido criado com sucesso na API:', normalizedData);
        
        // Adicionar ao cache para aparecer imediatamente
        this._pedidosCache.push(normalizedData);
        console.log('📦 Pedido adicionado ao cache. Total no cache:', this._pedidosCache.length);
        
        return normalizedData;
      } catch (apiError) {
        console.log('❌ Erro na API, salvando no cache local:', apiError.message);
        
        if (apiError.response) {
          console.error('📡 Status do erro:', apiError.response.status);
          console.error('📡 Dados do erro:', JSON.stringify(apiError.response.data, null, 2));
          
          // Tentar extrair detalhes do erro 422
          if (apiError.response.status === 422) {
            console.error('🔍 Erro de validação (422):', JSON.stringify(apiError.response.data, null, 2));
            
            // Mostrar campos que faltam
            if (apiError.response.data.detail) {
              apiError.response.data.detail.forEach(err => {
                console.error(`❌ Campo: ${err.loc.join('.')} - Erro: ${err.msg}`);
              });
            }
          }
        }
        
        // Mesmo com erro da API, criar no cache local para teste
        const novoPedido = {
          ...apiPedidoData,
          pedido_id: Date.now(), // ID temporário baseado no timestamp
          id: Date.now(),
          preco_total: parseFloat(apiPedidoData.preco_total) // Converter de volta para number no cache
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
      throw error; // Re-throw para que o CartModal possa tratar
    }
  }

  // Atualizar status do pedido
  static async atualizarStatusPedido(pedidoId, novoStatus) {
    try {
      console.log(`🔄 Atualizando status do pedido ${pedidoId} para ${novoStatus}...`);
      
      const requestData = {
        status: novoStatus
      };
      
      console.log('📦 Dados da requisição:', requestData);
      
      const response = await apiClient.put(`/pedidos/${pedidoId}/status`, requestData);
      
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
      
      // ✅ Log detalhado do erro para debug
      if (error.response) {
        console.error('📡 Status do erro:', error.response.status);
        console.error('📡 Dados do erro:', JSON.stringify(error.response.data, null, 2));
        
        // Detalhes específicos do erro 422
        if (error.response.status === 422) {
          console.error('🔍 Erro de validação (422):');
          if (error.response.data.detail) {
            error.response.data.detail.forEach(err => {
              console.error(`❌ Campo: ${err.loc?.join('.')} - Erro: ${err.msg} - Tipo: ${err.type}`);
            });
          }
        }
      }
      
      // Fallback para cache
      const pedido = this._pedidosCache.find(p => p.pedido_id === parseInt(pedidoId));
      if (pedido) {
        pedido.status = novoStatus;
        console.log('📦 Status atualizado no cache local');
        return { pedido_id: pedidoId, novo_status: novoStatus };
      }
      
      // Re-throw o erro para que o modal possa exibir mensagem de erro
      throw error;
    }
  }

  // Cancelar pedido
  static async cancelarPedido(pedidoId) {
    try {
      console.log(`🔄 Cancelando pedido ${pedidoId}...`);
      
      // Usar rota correta da API: PUT /pedidos/{id}/cancelar
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
      'em_preparo': 'Em preparo',
      'pronto': 'Pronto',
      'a_caminho': 'A caminho',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado',
      'concluido': 'Concluído'
    };
    return statusMap[status] || status;
  }

  // Verificar se o pedido está em andamento
  static isPedidoAtivo(status) {
    const statusAtivos = ['aguardando', 'em_preparo', 'pronto', 'a_caminho'];
    const isAtivo = statusAtivos.includes(status);
    console.log(`📦 Verificando se status '${status}' é ativo: ${isAtivo}`);
    return isAtivo;
  }

  // Calcular tempo estimado baseado no status
  static calcularTempoEstimado(status, dataPedido) {
    try {
      const agora = new Date();
      const dataInicio = new Date(dataPedido);
      const tempoDecorrido = Math.floor((agora - dataInicio) / (1000 * 60)); // em minutos
      
      const temposPorStatus = {
        'aguardando': 5,
        'em_preparo': 30,
        'pronto': 35,
        'a_caminho': 45
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

  // Buscar pedidos de um restaurante específico
  static async listarPedidosRestaurante(restauranteId) {
    try {
      console.log(`🔄 Buscando pedidos do restaurante ${restauranteId}...`);
      
      // Usar endpoint específico: GET /restaurantes/{id}/pedidos
      const response = await apiClient.get(`/restaurantes/${restauranteId}/pedidos`);
      const normalizedData = response.data.map(pedido => this.normalizePedidoData(pedido));
      
      console.log(`✅ Pedidos do restaurante ${restauranteId} carregados:`, normalizedData.length, 'pedidos');
      
      return normalizedData;
    } catch (error) {
      console.log(`📦 Erro ao buscar pedidos do restaurante ${restauranteId}:`, error.message);
      
      // Fallback: buscar todos os pedidos do cache e filtrar
      const todosPedidos = this._pedidosCache.length > 0 
        ? this._pedidosCache 
        : await this.listarPedidosCliente(1); // Fallback temporário
      
      // Filtrar pedidos do restaurante específico
      const pedidosDoRestaurante = todosPedidos.filter(
        pedido => pedido.restaurante_id === parseInt(restauranteId)
      );
      
      console.log(`📦 Pedidos encontrados no fallback:`, pedidosDoRestaurante.length);
      
      return pedidosDoRestaurante;
    }
  }

  // Método para limpar cache (útil para debug)
  static limparCache() {
    this._pedidosCache = [];
    console.log('🗑️ Cache de pedidos limpo');
  }

  // Método para ver cache (útil para debug)
  static verCache() {
    console.log('📦 Cache atual:', this._pedidosCache);
    return this._pedidosCache;
  }

  // Método para adicionar pedido ao cache manualmente (útil para testes)
  static adicionarAoCache(pedido) {
    const normalizedPedido = this.normalizePedidoData(pedido);
    this._pedidosCache.push(normalizedPedido);
    console.log('📦 Pedido adicionado manualmente ao cache:', normalizedPedido);
    return normalizedPedido;
  }

  // Método para remover pedido do cache
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

  // ✅ NOVA FUNÇÃO: Método para debug - testar funções de pedido ativo
  static debugPedidoAtivo() {
    console.log('🔍 Testando funções de pedido ativo...');
    
    // Testar isPedidoAtivo
    const statusTeste = ['aguardando', 'em_preparo', 'pronto', 'a_caminho', 'entregue', 'cancelado'];
    
    console.log('📦 Teste isPedidoAtivo:');
    statusTeste.forEach(status => {
      console.log(`  - ${status}: ${this.isPedidoAtivo(status)}`);
    });
    
    // Testar getStatusLabel
    console.log('📦 Teste getStatusLabel:');
    statusTeste.forEach(status => {
      console.log(`  - ${status}: ${this.getStatusLabel(status)}`);
    });
    
    // Testar com pedidos mock
    const pedidosMock = [
      { pedido_id: 1, status: 'aguardando', data_hora: '2025-01-15T10:00:00Z' },
      { pedido_id: 2, status: 'em_preparo', data_hora: '2025-01-15T11:00:00Z' },
      { pedido_id: 3, status: 'entregue', data_hora: '2025-01-15T09:00:00Z' }
    ];
    
    console.log('📦 Teste encontrarPedidoAtual:');
    const pedidoAtual = this.encontrarPedidoAtual(pedidosMock);
    console.log('  - Resultado:', pedidoAtual);
    
    console.log('📦 Teste filtrarPedidosPorTipo:');
    console.log('  - Ativos:', this.filtrarPedidosPorTipo(pedidosMock, 'ativos'));
    console.log('  - Histórico:', this.filtrarPedidosPorTipo(pedidosMock, 'historico'));
  }
}

export default PedidoService;