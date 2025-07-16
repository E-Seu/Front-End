import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Mock data para usuários (APENAS para fallback quando API não estiver disponível)
const MOCK_USUARIOS = [
  {
    usuario_id: 1,
    nome: "João Silva",
    email: "joao@email.com",
    senha: "123456",
    papel: "cliente"
  },
  {
    usuario_id: 2,
    nome: "Comida Paixão",
    email: "restaurante@email.com",
    senha: "123456",
    papel: "restaurante"
  },
  {
    usuario_id: 3,
    nome: "Pedro Oliveira",
    email: "pedro@email.com",
    senha: "123456",
    papel: "entregador"
  }
];

class LoginService {
  // Método para normalizar dados do usuário (formato da API)
  static normalizeUserData(usuario) {
    return {
      ...usuario,
      id: usuario.usuario_id,
      usuario_id: usuario.usuario_id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel, // 'cliente', 'restaurante', 'entregador'
      type: usuario.papel // Para compatibilidade com código existente
    };
  }

  // Login do usuário
  static async login(email, senha) {
    try {
      console.log(`🔄 Tentando login via API para: ${email}`);
      
      const response = await apiClient.post('/auth/login', {
        email: email,
        senha: senha
      });
      
      console.log('📡 Resposta da API:', response.data);
      
      const normalizedUser = this.normalizeUserData(response.data);
      
      // Salvar dados do usuário no AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(normalizedUser));
      await AsyncStorage.setItem('userToken', 'api-token');
      
      console.log('✅ Login realizado com sucesso via API:', normalizedUser);
      return { success: true, user: normalizedUser };
    } catch (error) {
      console.log('❌ Erro no login via API:', error.message);
      
      // Se a API não estiver disponível, tentar com mock (apenas para desenvolvimento)
      if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR' || !error.response) {
        console.log('📦 API não disponível, tentando com dados mock...');
        
        const usuario = MOCK_USUARIOS.find(u => u.email === email && u.senha === senha);
        if (usuario) {
          const normalizedUser = this.normalizeUserData(usuario);
          await AsyncStorage.setItem('userData', JSON.stringify(normalizedUser));
          await AsyncStorage.setItem('userToken', 'mock-token');
          
          console.log('✅ Login realizado com mock:', normalizedUser);
          return { success: true, user: normalizedUser };
        }
      }
      
      // Verificar se é erro de credenciais inválidas
      if (error.response && error.response.status === 401) {
        return { success: false, error: 'Email ou senha incorretos' };
      }
      
      return { success: false, error: 'Erro no servidor. Tente novamente.' };
    }
  }

  // Registro de novo usuário
  static async register(dadosUsuario) {
    try {
      console.log('🔄 Registrando novo usuário via API:', dadosUsuario);
      
      const response = await apiClient.post('/auth/register', {
        nome: dadosUsuario.nome,
        email: dadosUsuario.email,
        senha: dadosUsuario.senha,
        papel: dadosUsuario.papel // 'cliente', 'restaurante', 'entregador'
      });
      
      console.log('📡 Resposta da API:', response.data);
      
      const normalizedUser = this.normalizeUserData(response.data);
      
      // Salvar dados do usuário no AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(normalizedUser));
      await AsyncStorage.setItem('userToken', 'api-token');
      
      console.log('✅ Usuário registrado com sucesso via API:', normalizedUser);
      return { success: true, user: normalizedUser };
    } catch (error) {
      console.error('❌ Erro ao registrar usuário via API:', error.message);
      
      // Verificar se é erro de email já existente
      if (error.response && error.response.status === 400) {
        return { success: false, error: 'Email já cadastrado' };
      }
      
      return { success: false, error: 'Erro ao registrar usuário' };
    }
  }

  // Logout - apenas limpa dados locais (não chama API)
  static async logout() {
    try {
      console.log('🔄 Fazendo logout local...');
      
      // Limpar dados locais do AsyncStorage
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userToken');
      
      console.log('✅ Logout local realizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao fazer logout local:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar se usuário está logado
  static async isLoggedIn() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (userData && userToken) {
        const user = JSON.parse(userData);
        console.log('✅ Usuário logado encontrado:', user.email, '- Papel:', user.papel);
        return { isLoggedIn: true, user };
      }
      
      console.log('❌ Usuário não está logado');
      return { isLoggedIn: false, user: null };
    } catch (error) {
      console.error('❌ Erro ao verificar login:', error);
      return { isLoggedIn: false, user: null };
    }
  }

  // Obter dados do usuário atual
  static async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return { success: true, user };
      }
      return { success: false, error: 'Usuário não encontrado' };
    } catch (error) {
      console.error('❌ Erro ao obter usuário atual:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar se email já existe
  static async checkEmailExists(email) {
    try {
      const response = await apiClient.get(`/auth/check-email/${email}`);
      return { exists: response.data.exists };
    } catch (error) {
      console.log('❌ Erro ao verificar email via API:', error.message);
      return { exists: false };
    }
  }

  // Método para testar conectividade com API
  static async testApiConnection() {
    try {
      const response = await apiClient.get('/');
      console.log('✅ API está online:', response.data);
      return { online: true, data: response.data };
    } catch (error) {
      console.log('❌ API offline:', error.message);
      return { online: false, error: error.message };
    }
  }

  // Método utilitário para configurar URL da API
  static setApiUrl(url) {
    apiClient.defaults.baseURL = url;
    console.log(`🔧 URL da API alterada para: ${url}`);
  }
}

export default LoginService;