import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    // In actual implementation this fetches from backend
    // axios.get('http://localhost:5000/api/cvs', { headers: { Authorization: 'Bearer '+localStorage.getItem('token') } }).then(res => setCvs(res.data));
    // For now we mock it
    setCvs([{ id: 1, title: 'CV Administrador IT (Mocambique)', updated_at: new Date().toISOString() }]);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fafafa', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontFamily: 'Playfair Display, serif', fontWeight: '900' }}>Olá, {user.name}</h1>
            <p style={{ color: '#a1a1aa' }}>Bem-vindo ao seu painel principal.</p>
          </div>
          <button onClick={() => { sessionStorage.clear(); navigate('/login'); }} style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#fafafa', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
            Sair
          </button>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <div onClick={() => navigate('/cv/new')} style={{ flex: 1, background: '#18181b', border: '1px dashed #3f3f46', padding: '30px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
            <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Criar Novo Currículo</h3>
            <p style={{ fontSize: '13px', color: '#a1a1aa' }}>Use modelos europeus ou os novos padrões moçambicanos.</p>
          </div>
          <div onClick={() => navigate('/cover-letter')} style={{ flex: 1, background: '#18181b', border: '1px dashed #3f3f46', padding: '30px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✉️</div>
            <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>Gerar Carta de Apresentação</h3>
            <p style={{ fontSize: '13px', color: '#a1a1aa' }}>A IA gera e formata uma carta sob medida para a sua vaga.</p>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', borderBottom: '1px solid #27272a', paddingBottom: '12px', marginBottom: '20px' }}>Os seus Currículos Salvos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {cvs.map(cv => (
            <div key={cv.id} onClick={() => navigate(`/cv/${cv.id}`)} style={{ background: '#18181b', border: '1px solid #27272a', padding: '20px', borderRadius: '12px', cursor: 'pointer' }}>
              <h4 style={{ fontSize: '15px', marginBottom: '8px' }}>{cv.title}</h4>
              <p style={{ fontSize: '12px', color: '#71717a' }}>Atualizado em: {new Date(cv.updated_at).toLocaleDateString('pt-PT')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
