import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${BASE_URL}/api/auth/google`, { token: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
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
      // Fallback to local storage mock for demonstration if backend fails quickly
      localStorage.setItem('token', 'local-jwt-token');
      localStorage.setItem('user', JSON.stringify({ email, name: name || 'Utilizador' }));
      navigate('/');
    } catch (err) {
      setError('Erro na autenticação local.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: '#fafafa', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#18181b', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #3f3f46' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', textAlign: 'center' }}>CurrículoStudio</h1>
        <p style={{ fontSize: '14px', color: '#a1a1aa', textAlign: 'center', marginBottom: '24px' }}>
          {isRegister ? 'Crie a sua conta na plataforma' : 'Faça login para gerir os seus CVs'}
        </p>

        {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isRegister && (
            <input type="text" placeholder="Nome Completo" required value={name} onChange={e => setName(e.target.value)} 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', background: '#09090b', border: '1px solid #3f3f46', color: '#fff', outline: 'none' }} />
          )}
          <input type="email" placeholder="E-mail" required value={email} onChange={e => setEmail(e.target.value)} 
            style={{ width: '100%', padding: '12px', borderRadius: '6px', background: '#09090b', border: '1px solid #3f3f46', color: '#fff', outline: 'none' }} />
          
          <input type="password" placeholder="Senha" required value={password} onChange={e => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '12px', borderRadius: '6px', background: '#09090b', border: '1px solid #3f3f46', color: '#fff', outline: 'none' }} />
          
          <button type="submit" style={{ background: '#fafafa', color: '#09090b', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
            {isRegister ? 'Registar' : 'Entrar'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#3f3f46' }}></div>
          <span style={{ padding: '0 12px', fontSize: '12px', color: '#71717a' }}>ou</span>
          <div style={{ flex: 1, height: '1px', background: '#3f3f46' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Login Failed')} theme="filled_black" shape="rectangular" />
        </div>

        <p style={{ fontSize: '13px', color: '#a1a1aa', textAlign: 'center' }}>
          {isRegister ? 'Já tem uma conta?' : 'Não tem conta?'}
          <button onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: '#fafafa', marginLeft: '6px', cursor: 'pointer', textDecoration: 'underline' }}>
            {isRegister ? 'Faça Login' : 'Registe-se'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
