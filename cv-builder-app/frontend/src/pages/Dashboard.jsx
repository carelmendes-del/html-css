import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, Mail, Bot, Settings, Search, Clock, Plus, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    // In actual implementation this fetches from backend
    setCvs([
      { id: 1, title: 'CV Administrador IT (Moçambique)', updated_at: new Date().toISOString() },
      { id: 2, title: 'CV Gestor de Projetos', updated_at: new Date(Date.now() - 86400000).toISOString() }
    ]);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* 1. WELCOME BANNER (Balanced) */}
      <div className="banner-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '150px', height: '150px', background: 'var(--accent-glow)', filter: 'blur(50px)', opacity: 0.5 }}></div>
        <div style={{ zIndex: 1 }}>
          <h1 className="outfit gradient-text" style={{ fontSize: '32px', margin: 0 }}>Olá, {user.name || 'Candidato'} 👋</h1>
          <p style={{ margin: '8px 0 0', fontWeight: '500' }}>O teu estúdio profissional está pronto para novas conquistas.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/cv/new')} style={{ padding: '14px 24px', zIndex: 1 }}>
          <Plus size={20} /> Criar Novo Documento
        </button>
      </div>

      <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        
        {/* 2. RECENT DOCUMENTS (Main Panel) */}
        <div className="premium-card bento-span-2" style={{ padding: '32px', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="outfit" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} className="gradient-text" /> Documentos Recentes
            </h3>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input type="text" placeholder="Procurar..." style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '8px 12px 8px 36px', fontSize: '13px', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cvs.map(cv => (
              <div key={cv.id} className="nav-link" onClick={() => navigate(`/cv/${cv.id}`)} style={{ background: 'var(--bg-base)', padding: '16px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--bg-surface)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', border: '1px solid var(--border-subtle)' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="outfit" style={{ fontSize: '15px', margin: 0, color: 'var(--text-primary)' }}>{cv.title}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>viva em {new Date(cv.updated_at).toLocaleDateString('pt-PT')}</p>
                  </div>
                </div>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                  <Settings size={18} />
                </button>
              </div>
            ))}
          </div>

          <button style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '13px', marginTop: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Ver todos os documentos <ArrowRight size={14} />
          </button>
        </div>

        {/* 3. QUICK TOOLS (Side Panel) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="premium-card" onClick={() => navigate('/cover-letter')} style={{ padding: '24px', cursor: 'pointer' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Mail size={24} />
            </div>
            <h3 className="outfit" style={{ fontSize: '18px', marginBottom: '8px' }}>Carta de Apresentação</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.5' }}>Gera cartas personalizadas com IA para cada candidatura.</p>
          </div>

          <div className="premium-card" style={{ padding: '24px', opacity: 0.8 }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244, 114, 182, 0.1)', color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Bot size={24} />
            </div>
            <h3 className="outfit" style={{ fontSize: '18px', marginBottom: '8px' }}>Entrevista Guiada</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.5' }}>Deixa que a IA recolha os teus dados via chat. <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>(Brevemente)</span></p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
