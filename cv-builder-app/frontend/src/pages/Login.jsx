import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${BASE_URL}/api/auth/google`, { token: credentialResponse.credential });
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError('Erro ao fazer login com Google.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      // MOCK: in a full implementation, add register/login local routes
      sessionStorage.setItem('token', 'local-jwt-token');
      sessionStorage.setItem('user', JSON.stringify({ email, name: name || 'Utilizador' }));
      navigate('/');
    } catch (err) {
      setError('Erro na autenticação local.');
    }
  };

  const inputContainerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-strong)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  };

  const iconStyle = {
    color: 'var(--text-tertiary)',
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center'
  };

  const inputStyle = {
    width: '100%',
    padding: '16px 16px 16px 0',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'var(--font-body)'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'var(--accent-glow)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0, opacity: 0.5 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'rgba(192, 132, 252, 0.15)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0, opacity: 0.5 }}></div>

      <div className="glass-panel" style={{ padding: '48px', width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'var(--accent-glow)', color: 'var(--accent-primary)', marginBottom: '20px' }}>
            <Sparkles size={32} />
          </div>
          <h1 className="outfit gradient-text" style={{ fontSize: '32px', marginBottom: '8px' }}>CurrículoStudio</h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
            {isRegister ? 'Cria o teu perfil para começar' : 'Faça login para continuar o teu progresso'}
          </p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '10px', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {isRegister && (
            <div style={inputContainerStyle}>
              <div style={iconStyle}><User size={20} /></div>
              <input type="text" placeholder="Nome Completo" required value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            </div>
          )}
          
          <div style={inputContainerStyle}>
            <div style={iconStyle}><Mail size={20} /></div>
            <input type="email" placeholder="Endereço de E-mail" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </div>
          
          <div style={inputContainerStyle}>
            <div style={iconStyle}><Lock size={20} /></div>
            <input type={showPassword ? "text" : "password"} placeholder="Palavra-passe" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0 16px', display: 'flex', alignItems: 'center' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '8px', fontSize: '16px', padding: '16px' }}>
            {isRegister ? 'Registar Conta' : 'Entrar no Estúdio'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-strong)' }}></div>
          <span style={{ padding: '0 16px', fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>OU ENTRAR COM</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-strong)' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Falha no Login da Google')} theme="outline" size="large" shape="circular" width="100%" />
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
          {isRegister ? 'Já estás connosco?' : 'É a tua primeira vez?'}
          <button onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', marginLeft: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
            {isRegister ? 'Faz Login' : 'Cria Conta Livre'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
