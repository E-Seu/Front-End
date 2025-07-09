import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({});

// Mock de usuários para teste
const MOCK_USERS = [
  // Cliente
  {
    id: 1,
    nome: "João da Silva",
    email: "joao@email.com",
    senha: "123456",
    type: 'cliente'
  },
  
  // Restaurante
  {
    id: 2,
    nome: "Restaurante Novo",
    email: "restaurante@email.com",
    senha: "123456",
    type: 'restaurante'
  },
  
  // Entregador
  {
    id: 3,
    nome: "Maria Entregadora",
    email: "maria@email.com",
    senha: "123456",
    type: 'entregador'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    
    try {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Busca o usuário nos dados mock
      const foundUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.senha === password
      );
      
      if (foundUser) {
        // Remove a senha do objeto de usuário por segurança
        const { senha: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        setLoading(false);
        return { success: true, user: userWithoutPassword };
      } else {
        setLoading(false);
        return { success: false, error: 'Email ou senha incorretos' };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (userData) => {
    setLoading(true);
    
    try {
      // Simula delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verifica se o email já existe
      const emailExists = MOCK_USERS.some(
        u => u.email.toLowerCase() === userData.email.toLowerCase()
      );
      
      if (emailExists) {
        setLoading(false);
        return { success: false, error: 'Email já cadastrado' };
      }
      
      // Simula criação de novo usuário
      const newUser = {
        id: MOCK_USERS.length + 1,
        ...userData,
      };
      
      const { senha: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      setLoading(false);
      return { success: true, user: userWithoutPassword };
      
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  // Função para login rápido (para testes)
  const quickLogin = (userType) => {
    const user = MOCK_USERS.find(u => u.type === userType);
    if (user) {
      const { senha: _, ...userWithoutPassword } = user;
      setUser(userWithoutPassword);
    }
  };

  const value = {
    user,
    userName: user?.nome, // Nome do usuário para exibir "Olá fulano!"
    userType: user?.type,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    register,
    quickLogin,
    mockUsers: MOCK_USERS.map(u => ({ email: u.email, type: u.type }))
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};