import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import NeuralNetworkBackground from '../components/NeuralNetworkBackground';
import toast from 'react-hot-toast';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErro('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('triarc_email_token', data.token);
        localStorage.setItem('triarc_email_user', JSON.stringify(data.user));
        await onLogin(data.user);
      } else {
        setErro(data.error || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setErro('Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.loginRoot}>
      {/* Rede Neural Original (atrás) */}
      <NeuralNetworkBackground />
      
      {/* Logo pequena no canto superior esquerdo */}
      <div style={styles.logoTopLeft}>
        <img
          src="/logo_Triarc.png"
          alt="Triarc Solutions Logo"
          style={{ width: 24, height: 24 }}
        />
      </div>
      
      {/* Card de Login (na frente) */}
      <div style={styles.loginCard}>
        <div style={styles.loginHeader}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <img
                src="/logo_Triarc.png"
                alt="Triarc Solutions Logo"
                style={{ width: 48, height: 48, borderRadius: '50%' }}
              />
            </div>
            <div style={styles.logoText}>
              <div style={styles.logoTitle}>TRIARC SOLUTIONS</div>
              <div style={styles.logoSubtitle}>Sistema de Email Corporativo</div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.loginForm}>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Email Corporativo</label>
            <input 
              style={styles.input} 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="seu.email@triarcsolutions.com.br"
              autoComplete="username"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input 
                style={styles.input} 
                type={showPassword ? "text" : "password"}
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          {erro && <div style={styles.error}>{erro}</div>}
          
          <button style={styles.primaryBtn} type="submit" disabled={isLoading}>
            <span style={styles.btnText}>
              {isLoading ? 'Conectando...' : 'Conectar'}
            </span>
            <span style={styles.btnIcon}>→</span>
          </button>
        </form>
        
        <div style={styles.loginFooter}>
          <div style={styles.footerText}>Sistema de Email Corporativo</div>
          <div style={styles.footerSubtext}>Powered by Neural Network</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  loginRoot: { 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative',
    overflow: 'hidden',
    background: 'white'
  },
  logoTopLeft: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 20,
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50%',
    padding: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  loginCard: { 
    width: 420, 
    background: 'rgba(255, 255, 255, 0.95)', 
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)', 
    borderRadius: 20, 
    padding: 0,
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
    zIndex: 10,
    position: 'relative',
    overflow: 'hidden'
  },
  loginHeader: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #dc2626 50%, #22c55e 100%)',
    padding: '30px 30px 20px',
    textAlign: 'center',
    position: 'relative'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16
  },
  logoIcon: {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    width: 60,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)'
  },
  logoText: {
    textAlign: 'left'
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: '#ffffff',
    margin: 0,
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  logoSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
    fontWeight: 500
  },
  loginForm: {
    padding: '30px 30px 20px'
  },
  inputGroup: {
    marginBottom: 20
  },
  inputLabel: { 
    display: 'block', 
    fontSize: 14, 
    color: '#374151', 
    marginBottom: 8,
    fontWeight: 600
  },
  input: { 
    width: '100%', 
    padding: '14px 16px', 
    borderRadius: 12, 
    border: '2px solid #e5e7eb', 
    fontSize: 16,
    background: '#ffffff',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  },
  error: { 
    color: '#dc2626', 
    fontSize: 14, 
    marginTop: 8,
    background: '#fef2f2',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #fecaca'
  },
  primaryBtn: { 
    width: '100%', 
    marginTop: 20, 
    background: 'linear-gradient(135deg, #0ea5e9 0%, #dc2626 50%, #22c55e 100%)', 
    color: '#fff', 
    border: 'none', 
    borderRadius: 12, 
    padding: '16px 20px', 
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)'
  },
  btnText: {
    flex: 1
  },
  btnIcon: {
    fontSize: 18,
    transition: 'transform 0.3s ease'
  },
  loginFooter: {
    background: '#f8fafc',
    padding: '20px 30px',
    textAlign: 'center',
    borderTop: '1px solid #e5e7eb'
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 500,
    margin: 0
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    margin: '4px 0 0',
    fontStyle: 'italic'
  }
};

export default Login;
