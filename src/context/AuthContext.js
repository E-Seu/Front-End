import React, { createContext, useContext, useState } from 'react';
import LoginService from '../services/LoginService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    
    try {
      console.log('🔐 Fazendo login via API para:', email);
      
      const result = await LoginService.login(email, password);
      
      if (result.success) {
        console.log('✅ Login bem-sucedido via API:', result.user);
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        console.log('❌ Falha no login via API:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      console.log('🔓 Fazendo logout');
      
      await LoginService.logout();
      setUser(null);
      
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    
    try {
      console.log('📝 Registrando usuário via API:', userData.email);
      
      const result = await LoginService.register(userData);
      
      if (result.success) {
        console.log('✅ Usuário registrado com sucesso via API:', result.user);
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        console.log('❌ Falha no registro via API:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erro inesperado no registro:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userName: user?.nome,
    userType: user?.papel,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    register
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