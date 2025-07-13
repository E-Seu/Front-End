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
        senha: dadosCliente.senha
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
        senha: dadosEntregador.senha
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
      }
      
      return { success: false, error: 'Erro ao registrar entregador' };
    }
  }

  // Registrar restaurante
  static async registrarRestaurante(dadosRestaurante) {
    try {
      console.log('🔄 Registrando restaurante:', dadosRestaurante);
      
      const response = await apiClient.post('/auth/registrar/restaurante', {
        nome: dadosRestaurante.nome,
        email: dadosRestaurante.email,
        senha: dadosRestaurante.senha
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
      }
      
      return { success: false, error: 'Erro ao registrar restaurante' };
    }
  }

  // Validar campos obrigatórios
  static validarCampos(dados, camposObrigatorios) {
    const camposFaltando = [];
    
    camposObrigatorios.forEach(campo => {
      if (!dados[campo] || dados[campo].trim() === '') {
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
}

export default RegisterService;