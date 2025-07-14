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
      console.error('📡 Status do erro:', error.response.status);
      console.error('📡 Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
      
      // Mostrar detalhes do erro 422
      if (error.response.status === 422 && error.response.data.detail) {
        console.error('🔍 Erros de validação:');
        error.response.data.detail.forEach((err, index) => {
          console.error(`${index + 1}. Campo: ${err.loc.join('.')} - Erro: ${err.msg} - Tipo: ${err.type}`);
        });
      }
    }
    return Promise.reject(error);
  }
);

class RegisterService {
  // Registrar cliente
  static async registrarCliente(dadosCliente) {
    try {
      console.log('🔄 Registrando cliente:', dadosCliente);
      
      const response = await apiClient.post('/auth/registrar/cliente', {
        nome: dadosCliente.nome,
        email: dadosCliente.email,
        senha: dadosCliente.senha,
        telefone: dadosCliente.telefone || null,
        saldo: 0.0
      });
      
      console.log('✅ Cliente registrado com sucesso:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Erro ao registrar cliente:', error.message);
      
      if (error.response) {
        console.error('📡 Detalhes do erro:', error.response.data);
        
        // Verificar se é erro de email já existente
        if (error.response.status === 400) {
          return { success: false, error: 'Email já cadastrado' };
        }
        
        // Verificar se é erro de validação
        if (error.response.status === 422) {
          return { success: false, error: 'Dados inválidos. Verifique os campos obrigatórios.' };
        }
      }
      
      return { success: false, error: 'Erro ao registrar cliente' };
    }
  }

  // Registrar entregador
  static async registrarEntregador(dadosEntregador) {
    try {
      console.log('🔄 Registrando entregador:', dadosEntregador);
      
      const response = await apiClient.post('/auth/registrar/entregador', {
        nome: dadosEntregador.nome,
        email: dadosEntregador.email,
        senha: dadosEntregador.senha,
        telefone: dadosEntregador.telefone || null,
        veiculo: dadosEntregador.veiculo || "Bicicleta",
        disponivel: true,
        saldo: 0.0
      });
      
      console.log('✅ Entregador registrado com sucesso:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Erro ao registrar entregador:', error.message);
      
      if (error.response) {
        console.error('📡 Detalhes do erro:', error.response.data);
        
        if (error.response.status === 400) {
          return { success: false, error: 'Email já cadastrado' };
        }
        
        if (error.response.status === 422) {
          return { success: false, error: 'Dados inválidos. Verifique os campos obrigatórios.' };
        }
      }
      
      return { success: false, error: 'Erro ao registrar entregador' };
    }
  }

  // Registrar restaurante - ✅ Atualizado conforme exemplo
  static async registrarRestaurante(dadosRestaurante) {
    try {
      console.log('🔄 Registrando restaurante:', dadosRestaurante);
      
      const response = await apiClient.post('/auth/registrar/restaurante', {
        nome: dadosRestaurante.nome,
        email: dadosRestaurante.email,
        senha: dadosRestaurante.senha,
        info: dadosRestaurante.info,
        local: dadosRestaurante.local,
        horario_abertura: dadosRestaurante.horario_abertura,
        horario_fechamento: dadosRestaurante.horario_fechamento,
        telefone: dadosRestaurante.telefone,         // Opcional
        tipo_restaurante: dadosRestaurante.tipo,     // Opcional - mapeado de 'tipo' para 'tipo_restaurante'
        numero_estrelas: 0.0,
        disponivel: true,
        saldo: 0.0
      });
      
      console.log('✅ Restaurante registrado com sucesso:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Erro ao registrar restaurante:', error.message);
      
      if (error.response) {
        console.error('📡 Detalhes do erro:', error.response.data);
        
        if (error.response.status === 400) {
          return { success: false, error: 'Email já cadastrado' };
        }
        
        if (error.response.status === 422) {
          return { success: false, error: 'Dados inválidos. Verifique os campos obrigatórios.' };
        }
      }
      
      return { success: false, error: 'Erro ao registrar restaurante' };
    }
  }

  // ✅ Versão alternativa usando fetch (como no exemplo)
  static async registrarRestauranteFetch(dadosRestaurante) {
    try {
      console.log('🔄 Registrando restaurante (fetch):', dadosRestaurante);
      
      const response = await fetch(`${API_BASE_URL}/auth/registrar/restaurante`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: dadosRestaurante.nome,
          email: dadosRestaurante.email,
          senha: dadosRestaurante.senha,
          info: dadosRestaurante.info,
          local: dadosRestaurante.local,
          horario_abertura: dadosRestaurante.horario_abertura,
          horario_fechamento: dadosRestaurante.horario_fechamento,
          telefone: dadosRestaurante.telefone,         // Opcional
          tipo_restaurante: dadosRestaurante.tipo,     // Opcional
          numero_estrelas: 0.0,
          disponivel: true,
          saldo: 0.0
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Restaurante registrado com sucesso:', result);
        return { success: true, data: result };
      } else {
        console.error('❌ Erro na resposta:', result);
        
        if (response.status === 400) {
          return { success: false, error: 'Email já cadastrado' };
        }
        
        if (response.status === 422) {
          return { success: false, error: 'Dados inválidos. Verifique os campos obrigatórios.' };
        }
        
        return { success: false, error: result.detail || 'Erro ao registrar restaurante' };
      }
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      return { success: false, error: 'Erro ao registrar restaurante' };
    }
  }

  // Validar campos obrigatórios
  static validarCampos(dados, camposObrigatorios) {
    const camposFaltando = [];
    
    camposObrigatorios.forEach(campo => {
      if (!dados[campo] || (typeof dados[campo] === 'string' && dados[campo].trim() === '')) {
        camposFaltando.push(campo);
      }
    });
    
    return camposFaltando;
  }

  // Validar email
  static validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar senha
  static validarSenha(senha) {
    return senha && senha.length >= 6;
  }

  // Verificar se senhas coincidem
  static verificarSenhas(senha, confirmacaoSenha) {
    return senha === confirmacaoSenha;
  }

  // ✅ Validar dados do restaurante - atualizado
  static validarDadosRestaurante(dados) {
    const camposObrigatorios = ['nome', 'email', 'senha', 'info', 'local', 'horario_abertura', 'horario_fechamento'];
    const camposFaltando = this.validarCampos(dados, camposObrigatorios);
    
    if (camposFaltando.length > 0) {
      return { valid: false, errors: camposFaltando };
    }
    
    if (!this.validarEmail(dados.email)) {
      return { valid: false, errors: ['email inválido'] };
    }
    
    if (!this.validarSenha(dados.senha)) {
      return { valid: false, errors: ['senha deve ter pelo menos 6 caracteres'] };
    }
    
    return { valid: true, errors: [] };
  }

  // ✅ Validar dados do cliente
  static validarDadosCliente(dados) {
    const camposObrigatorios = ['nome', 'email', 'senha'];
    const camposFaltando = this.validarCampos(dados, camposObrigatorios);
    
    if (camposFaltando.length > 0) {
      return { valid: false, errors: camposFaltando };
    }
    
    if (!this.validarEmail(dados.email)) {
      return { valid: false, errors: ['email inválido'] };
    }
    
    if (!this.validarSenha(dados.senha)) {
      return { valid: false, errors: ['senha deve ter pelo menos 6 caracteres'] };
    }
    
    return { valid: true, errors: [] };
  }

  // ✅ Validar dados do entregador
  static validarDadosEntregador(dados) {
    const camposObrigatorios = ['nome', 'email', 'senha'];
    const camposFaltando = this.validarCampos(dados, camposObrigatorios);
    
    if (camposFaltando.length > 0) {
      return { valid: false, errors: camposFaltando };
    }
    
    if (!this.validarEmail(dados.email)) {
      return { valid: false, errors: ['email inválido'] };
    }
    
    if (!this.validarSenha(dados.senha)) {
      return { valid: false, errors: ['senha deve ter pelo menos 6 caracteres'] };
    }
    
    return { valid: true, errors: [] };
  }

  // ✅ Preparar dados do restaurante - atualizado
  static prepararDadosRestaurante(dados) {
    return {
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha,
      info: dados.info,
      local: dados.local,
      horario_abertura: dados.horario_abertura,
      horario_fechamento: dados.horario_fechamento,
      telefone: dados.telefone || null,
      tipo: dados.tipo || null, // Será mapeado para tipo_restaurante
      numero_estrelas: 0.0,
      disponivel: true,
      saldo: 0.0
    };
  }

  // ✅ Preparar dados do cliente
  static prepararDadosCliente(dados) {
    return {
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha,
      telefone: dados.telefone || null,
      saldo: 0.0
    };
  }

  // ✅ Preparar dados do entregador
  static prepararDadosEntregador(dados) {
    return {
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha,
      telefone: dados.telefone || null,
      veiculo: dados.veiculo || "Bicicleta",
      disponivel: true,
      saldo: 0.0
    };
  }

  // Método utilitário para configurar URL da API
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

  // ✅ Método para testar conexão com registro
  static async testarConexaoRegistro() {
    try {
      console.log('🔍 Testando conexão com endpoints de registro...');
      
      // Testar se a API está online
      const status = await this.checkApiStatus();
      console.log('🔄 Status da API:', status);
      
      return status;
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      return { online: false, error: error.message };
    }
  }
}

export default RegisterService;