import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import axios from 'axios';

// Configurar axios para produção
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin + '/api'
  : 'http://localhost:5000/api';

axios.defaults.baseURL = API_BASE_URL;

const EmailDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Limpar localStorage para garantir login obrigatório
    localStorage.removeItem('triarc_email_token');
    localStorage.removeItem('triarc_email_user');
    setIsAuthenticated(false);
    setUser(null);
    console.log('Sistema iniciado - login obrigatório');
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('triarc_email_token');
      const userData = localStorage.getItem('triarc_email_user');
      
      // SEMPRE exigir login - não permitir acesso automático
      if (!token || !userData) {
        console.log('Nenhum token encontrado - exigindo login');
        setIsAuthenticated(false);
        return;
      }

      // Validar token com o backend
      const response = await axios.get('http://localhost:5000/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        console.log('Token válido - usuário autenticado');
      } else {
        throw new Error('Token inválido');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('triarc_email_token');
      localStorage.removeItem('triarc_email_user');
      setIsAuthenticated(false);
      console.log('Token inválido - removido do localStorage');
    }
  };

  const handleLogin = async (userData) => {
    try {
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('triarc_email_token');
    setIsAuthenticated(false);
    setUser(null);
    toast.success('Logout realizado com sucesso!');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
};

export default EmailDashboard;
