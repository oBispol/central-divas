import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    try {
      const result = await api.login(email, senha);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Erro ao fazer login',
      };
    }
  };

  const register = async (data) => {
    try {
      await api.register(data.nome, data.email, data.senha, data.whatsapp);
      return { success: true, message: 'Cadastro realizado com sucesso!' };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Erro ao fazer cadastro',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAdmin: user?.tipo === 'admin' || user?.tipo === 'superadmin',
        isSuperAdmin: user?.tipo === 'superadmin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
