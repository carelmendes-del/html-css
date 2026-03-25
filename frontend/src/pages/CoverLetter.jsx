import React, { useState } from 'react';
import axios from 'axios';

const CoverLetter = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [cvText, setCvText] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!jobDescription || !cvText) {
      setError('Por favor, preencha a descrição da vaga e os dados base (ou cole o seu CV).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const prompt = `Atue como um redator profissional de carreira (foco no mercado moçambicano/lusófono). Escreva uma Carta de Apresentação formal, motivadora e polida para a seguinte Vaga:\n"${jobDescription}"\n\nBaseie-se neste currículo/perfil do candidato para destacar as valências compatíveis:\n"${cvText}"\n\nA resposta deve conter apenas o texto da carta de apresentação formatado de forma limpa, sem comentários adicionais.`;
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${BASE_URL}/api/ai/generate`, { prompt, text: '' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setLetterContent(res.data.content);
    } catch (err) {
      setError('Erro ao comunicar com a IA. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#09090b', color: '#fafafa', fontFamily: 'sans-serif' }}>
      
      <div style={{ width: '400px', borderRight: '1px solid #27272a', padding: '24px', display: 'flex', flexDirection: 'column', background: '#18181b', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '8px', color: '#f4f4f5' }}>Gerador de Cartas de Apresentação</h2>
        <p style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '24px' }}>Nossa IA cruza o seu perfil profissional com os requisitos da vaga para criar cartas perfeitamente alinhadas e persuasivas.</p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '8px' }}>Descrição da Vaga / Requisitos</label>
          <textarea 
            value={jobDescription} onChange={e => setJobDescription(e.target.value)}
            style={{ width: '100%', height: '180px', background: '#09090b', border: '1px solid #3f3f46', color: '#fafafa', padding: '12px', borderRadius: '8px', outline: 'none', resize: 'vertical' }}
            placeholder="Cole aqui o anúncio de emprego... ex: 'Procuramos um Gestor de TI com 5 anos de experiência para a região de Maputo...'"
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#a1a1aa', marginBottom: '8px' }}>O seu Perfil Base (ou CV copiado)</label>
          <textarea 
            value={cvText} onChange={e => setCvText(e.target.value)}
            style={{ width: '100%', height: '220px', background: '#09090b', border: '1px solid #3f3f46', color: '#fafafa', padding: '12px', borderRadius: '8px', outline: 'none', resize: 'vertical' }}
            placeholder="Resuma a sua experiência ou cole o texto do seu Currículo..."
          />
        </div>

        {error && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          style={{ background: '#fafafa', color: '#09090b', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Gerando com IA...' : 'Gerar Carta ✨'}
        </button>
      </div>

      <div style={{ flex: 1, padding: '40px', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
             {letterContent && (
               <button onClick={handlePrint} style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#fafafa', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                 🖨️ Baixar / Imprimir PDF
               </button>
             )}
          </div>

          <div style={{ background: '#ffffff', color: '#1a1a1a', padding: '60px', borderRadius: '8px', minHeight: '842px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            {!letterContent ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', flexDirection: 'column' }}>
                <span style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</span>
                A sua carta magicamente escrita pela IA aparecerá aqui.
              </div>
            ) : (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '15px', fontFamily: 'Cormorant Garamond, serif' }}>
                {letterContent}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estilos para @media print para imprimir a carta perfeitamente sem o UI */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable, .printable * { visibility: visible; }
          .printable { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border-radius: 0; padding: 0 !important; }
        }
      `}</style>

    </div>
  );
};

export default CoverLetter;
