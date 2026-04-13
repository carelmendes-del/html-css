import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { ChevronLeft, Download, FileText, Wand2 } from 'lucide-react';

const LetterView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const res = await api.get(`/api/letters/${id}`);
        setLetter(res.data);
      } catch (err) {
        console.error('Falha ao carregar carta:', err);
        setError('Não foi possível carregar a carta selecionada.');
      } finally {
        setLoading(false);
      }
    };
    fetchLetter();
  }, [id]);

  const handlePrint = () => window.print();

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)' }}>
      
      {/* HEADER */}
      <div className="no-print" style={{ background: 'var(--bg-surface)', minHeight: '60px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 100, padding: '8px 0' }}>
        <div className="flex flex-wrap items-center justify-between w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 gap-2">
          
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate('/')} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <ChevronLeft size={16} /> Voltar
            </button>
            <div className="hidden sm:flex" style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <FileText size={16} /> Visualizador de Cartas
            </div>
          </div>

          <div className="flex gap-2">
             {letter && (
               <button onClick={handlePrint} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                 <Download size={16} /> Baixar PDF
               </button>
             )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center p-4 sm:p-6 lg:p-[60px_20px]">
        
        {loading ? (
          <div style={{ color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
            <Wand2 size={48} style={{ opacity: 0.5, marginBottom: '20px' }} />
            A carregar o documento...
          </div>
        ) : error ? (
          <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '20px', borderRadius: '12px', height: 'fit-content' }}>
            {error}
          </div>
        ) : letter ? (
          <div className="printable-document" style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: '850px', minHeight: '1000px', padding: 'clamp(24px, 5vw, 80px) clamp(20px, 6vw, 100px)', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              
              <div style={{ lineHeight: '1.7', fontSize: 'clamp(14px, 2vw, 16px)', fontFamily: '"Playfair Display", serif', color: 'var(--text-primary)' }}>
                 <div style={{ marginBottom: '40px', borderBottom: '3px solid var(--text-primary)', paddingBottom: '20px' }}>
                    <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: '900' }}>{letter.content.nome}</h1>
                 </div>
                 
                 <p style={{ textAlign: 'right', marginBottom: '32px' }}>{new Date(letter.created_at).toLocaleDateString('pt-PT')}</p>
                 
                 <div style={{ marginBottom: '40px' }}>
                    <p style={{ fontWeight: 'bold', margin:0 }}>Departamento de Seleção</p>
                    <p style={{ color: 'var(--text-secondary)', margin:0 }}>Empresa Destinatária</p>
                 </div>
                 
                 <p style={{ fontWeight: '900', padding: '12px 16px', background: 'var(--bg-base)', borderLeft: '4px solid var(--text-primary)', marginBottom: '32px' }}>
                    ASSUNTO: {letter.content.assunto}
                 </p>
                 
                 <p style={{ fontWeight: 'bold', marginBottom: '24px' }}>{letter.content.saudacao}</p>
                 
                 <div style={{ textAlign: 'justify', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p>{letter.content.paragrafo1}</p>
                    <p>{letter.content.paragrafo2}</p>
                    <p>{letter.content.paragrafo3}</p>
                 </div>
                 
                 <div style={{ marginTop: '60px' }}>
                    <p style={{ marginBottom: '40px' }}>{letter.content.encerramento}</p>
                    <p style={{ fontWeight: '900', fontSize: '20px' }}>{letter.content.nome}</p>
                 </div>
              </div>

          </div>
        ) : null}

      </div>

      <style>{`
        @media print {
          @page { size: auto; margin: 0; }
          body { margin: 0; background: #fff !important; }
          .no-print, .no-print * { display: none !important; opacity: 0 !important; visibility: hidden !important; }
          .printable-document, .printable-document * { 
            visibility: visible !important; 
            color: #000 !important; 
            opacity: 1 !important;
            display: block;
          }
          .printable-document { 
            position: fixed !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 210mm !important; 
            height: auto !important;
            padding: 2.5cm !important; 
            box-shadow: none !important; 
            border: none !important; 
            background: #fff !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LetterView;
