import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Briefcase, Wand2, Printer, ChevronLeft, Building2 } from 'lucide-react';
import axios from 'axios';

const CoverLetter = () => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [cvText, setCvText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [letterContent, setLetterContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!jobDescription || !cvText) {
      setError('Por favor, preencha a vaga e o seu resumo profissional (CV).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = sessionStorage.getItem('token');
      
      const res = await axios.post(`${BASE_URL}/api/ai/generate-cover-letter`, { 
        dados: cvText, 
        vaga: jobDescription,
        empresa: companyName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // A API devolve o JSON perfeitamente estruturado graças a "buildCartaPrompt"
      setLetterContent(res.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao comunicar com a IA. Tente iniciar o servidor Backend ou verificar a chave API.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-strong)',
    color: 'var(--text-primary)',
    padding: '16px',
    borderRadius: '12px',
    outline: 'none',
    fontSize: '14px',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <div className="mobile-flex-col" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
      
      {/* LATERAL EDITOR PANEL */}
      <div className="glass-panel mobile-full-width" style={{ width: '450px', maxWidth: '100%', display: 'flex', flexDirection: 'column', zIndex: 10, margin: '20px', padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
        
        {/* HEADER */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '0', fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>
            <ChevronLeft size={18} /> Voltar ao Dashboard
          </button>
          <h2 className="outfit gradient-text" style={{ fontSize: '24px', margin: 0 }}>Gerador de Cartas</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
            A Nossa IA cruza o seu perfil profissional com os requisitos da vaga para criar cartas perfeitamente alinhadas e persuasivas usando tom formal exigido no mercado.
          </p>
        </div>

        {/* BODY */}
        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}><Building2 size={16} /> Empresa Alvo (Opcional)</label>
            <input 
              type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
              style={inputStyle}
              placeholder="ex: Moza Banco, Vodacom..."
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}><Briefcase size={16} /> Descrição da Vaga / Requisitos</label>
            <textarea 
              value={jobDescription} onChange={e => setJobDescription(e.target.value)}
              style={{ ...inputStyle, height: '140px', resize: 'vertical' }}
              placeholder="Cole aqui o anúncio de emprego... ex: 'Procuramos um Gestor de TI com 5 anos de experiência...'"
            />
          </div>

          <div style={{ marginBottom: '40px' }}>
            <label style={labelStyle}><FileText size={16} /> O seu Perfil Base (ou CV copiado)</label>
            <textarea 
              value={cvText} onChange={e => setCvText(e.target.value)}
              style={{ ...inputStyle, height: '200px', resize: 'vertical' }}
              placeholder="Resuma a sua experiência ou cole o texto inteiro do seu Currículo para a IA analisar..."
            />
          </div>

          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', fontSize: '13px', marginBottom: '24px' }}>{error}</div>}

          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'A Escrever com IA...' : <><Wand2 size={18} /> Redigir Carta Impecável</>}
          </button>
        </div>
      </div>

      {/* RENDER PANEL */}
      <div className="mobile-p-20" style={{ flex: 1, padding: '40px', display: 'flex', justifyContent: 'center', overflowY: 'auto', position: 'relative' }}>
        
        {/* Background Accents */}
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '400px', height: '400px', background: 'var(--accent-glow)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0, opacity: 0.3, pointerEvents: 'none' }}></div>

        <div style={{ width: '100%', maxWidth: '800px', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
             {letterContent && (
               <button onClick={handlePrint} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Printer size={18} /> Baixar / Imprimir PDF
               </button>
             )}
          </div>

          {/* DOCUMENT PAPER */}
          <div className="printable-document mobile-doc-padding" style={{ background: '#ffffff', color: '#111827', padding: '80px 100px', borderRadius: '8px', minHeight: '1000px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            {!letterContent ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexDirection: 'column', textAlign: 'center' }}>
                <div style={{ background: '#f3f4f6', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <Wand2 size={32} color="#9ca3af" />
                </div>
                <h3 style={{ fontSize: '20px', color: '#4b5563', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>Folha em Branco</h3>
                <p style={{ maxWidth: '300px', lineHeight: '1.6' }}>Preencha os campos à esquerda e a sua carta de apresentação corporativa ganhará forma aqui.</p>
              </div>
            ) : (
              <div style={{ lineHeight: '1.8', fontSize: '15px', fontFamily: '"Georgia", serif' }}>
                <p style={{ textAlign: 'right', marginBottom: '40px', color: '#4b5563' }}>
                  {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>

                <p style={{ fontWeight: 'bold', marginBottom: '24px', fontSize: '16px' }}>
                  Assunto: {letterContent.assunto || 'Candidatura'}
                </p>

                <p style={{ marginBottom: '24px' }}>
                  {letterContent.saudacao || 'Exmo.(a) Senhor(a),'}
                </p>

                <p style={{ marginBottom: '16px', textAlign: 'justify' }}>
                  {letterContent.paragrafo1}
                </p>
                
                <p style={{ marginBottom: '16px', textAlign: 'justify' }}>
                  {letterContent.paragrafo2}
                </p>

                <p style={{ marginBottom: '32px', textAlign: 'justify' }}>
                  {letterContent.paragrafo3}
                </p>

                <p style={{ marginBottom: '16px' }}>
                  {letterContent.encerramento || 'Com os melhores cumprimentos,'}
                </p>
                <p style={{ fontWeight: 'bold' }}>
                  {letterContent.nome || '[Seu Nome]'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-document, .printable-document * { visibility: visible; }
          .printable-document { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border-radius: 0; padding: 0 !important; background: transparent; }
          @page { margin: 2cm; }
        }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }

        @media (max-width: 768px) {
          .mobile-doc-padding {
            padding: 30px 20px !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CoverLetter;
