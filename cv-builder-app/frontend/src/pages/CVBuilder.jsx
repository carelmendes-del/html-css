import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { renderCV } from '../components/CVRenderer';
import '../components/CVRenderer.css';
import html2pdf from 'html2pdf.js';
import axios from 'axios';

const CVBuilder = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('cv_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: '', title: '', email: '', phone: '', location: '', linkedin: '',
      nacionalidade: '', dataNascimento: '', estadoCivil: '', bi: '', photo: null,
      summary: '',
      experiences: [], educations: [], courses: [], languages: [], skills: []
    };
  });

  const [template, setTemplate] = useState(() => Number(localStorage.getItem('cv_template')) || 1);
  const [activeTab, setActiveTab] = useState('pessoais');
  const [lang, setLang] = useState(() => localStorage.getItem('cv_lang') || 'pt');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [useAi, setUseAi] = useState(true);
  const [autoSummary, setAutoSummary] = useState(true);
  const [skillInput, setSkillInput] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('cv_theme') || 'dark');
  const [showPreview, setShowPreview] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('cv_data', JSON.stringify(data));
    localStorage.setItem('cv_template', template);
    localStorage.setItem('cv_lang', lang);
    localStorage.setItem('cv_theme', theme);
  }, [data, template, lang, theme]);

  // Using new universal variables
  const inputStyle = { width: '100%', padding: '12px 16px', marginBottom: '14px', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' };
  const labelStyle = { display: 'block', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700' };
  const cardStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '24px', borderRadius: '16px', marginBottom: '16px', position: 'relative', boxShadow: 'var(--shadow-sm)' };
  const removeBtnStyle = { position: 'absolute', top: '12px', right: '12px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' };
  const addBtnStyle = { width: '100%', padding: '14px', border: '2px dashed var(--border-strong)', background: 'transparent', color: 'var(--text-secondary)', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' };

  const handlePdfDownload = () => {
    setAlertMsg('Dica: Na janela de impressão, escolha "Guardar como PDF" ou "Save as PDF" como destino.\nIsso garante um documento com texto selecionável e máxima qualidade.');
    window.print();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setData({ ...data, photo: ev.target.result });
      reader.readAsDataURL(file);
    }
  };

  const handleAiReview = async () => {
    setShowPreview(true);
    if (!reviewData) {
      setReviewLoading(true);
      try {
        const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.post(`${BASE_URL}/api/ai/review`, { cvGerado: data }, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
        });
        setReviewData(res.data);
      } catch (err) {
        console.error(err);
        setAlertMsg('Falha ao obter conselhos de IA. Verifique se o backend está ligado.');
      } finally {
        setReviewLoading(false);
      }
    }
  };

  const handleLocalImport = () => {
    setAiLoading(true);
    try {
      const text = aiText;
      const extracted = {
        name: '', title: '', email: '', phone: '', summary: '',
        experiences: [], educations: [], courses: [], languages: [], skills: []
      };

      // 1. Email e Telefone (Regex)
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) extracted.email = emailMatch[0];

      const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
      if (phoneMatch) extracted.phone = phoneMatch[0];

      // 2. Nome e Cargo: Presumir as primeiras linhas
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) extracted.name = lines[0].substring(0, 50);
      if (lines.length > 1 && !lines[1].includes('@') && lines[1].length < 60) {
        extracted.title = lines[1];
      }

      // 3. Captura Grosseira de Blocos
      const lower = text.toLowerCase();
      const getBlock = (startWords, endWords) => {
        let startIdx = -1;
        for (const w of startWords) {
          startIdx = lower.indexOf(w);
          if (startIdx !== -1) break;
        }
        if (startIdx === -1) return '';
        let endIdx = text.length;
        for (const w of endWords) {
          const idx = lower.indexOf(w, startIdx + 15);
          if (idx !== -1 && idx < endIdx) endIdx = idx;
        }
        return text.substring(startIdx, endIdx).split('\n').slice(1).join('\n').trim();
      };

      const expText = getBlock(['experiência', 'experiencia', 'histórico profissional', 'experience'], ['formação', 'educação', 'cursos', 'competências', 'idiomas']);
      if (expText) {
        extracted.experiences.push({ id: Date.now(), role: 'Rever Cargo', company: '', period: '', desc: expText.substring(0, 600) });
      }

      const eduText = getBlock(['formação', 'formacao', 'educação', 'habilitações'], ['experiência', 'cursos', 'competências', 'idiomas']);
      if (eduText) {
        extracted.educations.push({ id: Date.now(), degree: 'Rever Formação', institution: eduText.substring(0, 80), period: '' });
      }

      const skillsText = getBlock(['competências', 'competencias', 'skills', 'qualificações'], ['idiomas', 'cursos', 'experiência']);
      if (skillsText) {
        extracted.skills = skillsText.split(/,|\n/).map(s => s.trim()).filter(s => s.length > 2 && s.length < 35).slice(0, 8);
      }

      extracted.summary = "Dados extraídos localmente com sucesso. Por favor, reveja e edite cada campo para garantir a máxima precisão.";

      // Mesclar e manter o que já exista
      setData(prev => ({ ...prev, ...extracted }));
      setShowAiModal(false);
      setAlertMsg('Importação Offline concluída! \nComo este modo não usa Inteligência Artificial, a organização final depende de revisão manual.');
    } catch (err) {
      setAlertMsg("Erro ao processar o texto localmente.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiImport = async () => {
    if (!apiKey) {
      setAlertMsg("Por favor, insira a sua API Key do Google Gemini.");
      return;
    }
    if (!aiText) {
      setAlertMsg("Por favor, selecione um ficheiro ou cole o texto do currículo.");
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Você é um perito em Recursos Humanos. Vou enviar o texto sujo de um CV. 
O seu objetivo é estruturar este texto estritamente como JSON válido.
${autoSummary ? 'INSTRUÇÃO ESPECIAL: Escreva um excelente Perfil Pessoal/Resumo de 3 a 4 frases no campo "summary" descrevendo as soft e hard skills deste profissional baseado nas experiências que encontrar, caso o texto não tenha um ou caso seja muito fraco. Deixe o resumo bem vendedor e profissional.' : 'No campo "summary", coloque apenas o resumo que encontrar no texto original.'}

JSON STRUCTURE REQUIRED:
{
  "name": "string",
  "title": "string (cargo principal)",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string",
  "summary": "string",
  "experiences": [{"id": 0, "role": "string", "company": "string", "period": "string", "desc": "string(muito detalhado, preserve o texto original)"}],
  "educations": [{"id": 0, "degree": "string", "institution": "string", "period": "string"}],
  "courses": [{"id": 0, "name": "string", "institution": "string", "year": "string"}],
  "skills": ["string", "string"],
  "languages": [{"id": 0, "name": "string", "level": "Nativo/Fluente/Avançado/Intermediário/Básico"}]
}

TEXTO DO CV:
---
${aiText}
---`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) {
        throw new Error("Erro na API do Gemini. A sua API Key é inválida ou expirou.");
      }

      const raw = await response.json();
      const textResponse = raw.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(textResponse);

      const addIds = (arr) => (arr && Array.isArray(arr) ? arr.map((item, i) => ({ ...item, id: Date.now() + i })) : []);

      const newExtracted = {
        name: parsed.name || '',
        title: parsed.title || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        location: parsed.location || '',
        linkedin: parsed.linkedin || '',
        summary: parsed.summary || '',
        experiences: addIds(parsed.experiences),
        educations: addIds(parsed.educations),
        courses: addIds(parsed.courses),
        languages: addIds(parsed.languages),
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      };

      setData(prev => ({ ...prev, ...newExtracted }));
      setShowAiModal(false);
      setAiText('');
      setAlertMsg('✨ Importação IA concluída com sucesso! Os seus dados foram minuciosamente organizados em cada secção.');

    } catch (err) {
      console.error(err);
      setAlertMsg("Falha GenAI: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAiLoading(true);
    setAiText('Lendo arquivo...');

    try {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(s => s.str).join(' ') + '\n';
        }
        setAiText(text);
      } else if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        setAiText(result.value);
      } else {
        setAlertMsg("Formato não suportado. Use um ficheiro PDF ou Word (.docx).");
        setAiText('');
      }
    } catch (err) {
      console.error(err);
      setAlertMsg("Erro ao extrair o texto do arquivo.");
      setAiText('');
    } finally {
      setAiLoading(false);
      e.target.value = '';
    }
  };

  // ARR MGT
  const addExp = () => setData(p => ({ ...p, experiences: [...p.experiences, { id: Date.now(), role: '', company: '', period: '', desc: '' }] }));
  const updateExp = (id, key, val) => setData(p => ({ ...p, experiences: p.experiences.map(x => x.id === id ? { ...x, [key]: val } : x) }));
  const removeExp = id => setData(p => ({ ...p, experiences: p.experiences.filter(x => x.id !== id) }));

  const addEdu = () => setData(p => ({ ...p, educations: [...p.educations, { id: Date.now(), degree: '', institution: '', period: '' }] }));
  const updateEdu = (id, key, val) => setData(p => ({ ...p, educations: p.educations.map(x => x.id === id ? { ...x, [key]: val } : x) }));
  const removeEdu = id => setData(p => ({ ...p, educations: p.educations.filter(x => x.id !== id) }));

  const addCourse = () => setData(p => ({ ...p, courses: [...p.courses, { id: Date.now(), name: '', institution: '', year: '' }] }));
  const updateCourse = (id, key, val) => setData(p => ({ ...p, courses: p.courses.map(x => x.id === id ? { ...x, [key]: val } : x) }));
  const removeCourse = id => setData(p => ({ ...p, courses: p.courses.filter(x => x.id !== id) }));

  const addLang = () => setData(p => ({ ...p, languages: [...p.languages, { id: Date.now(), name: '', level: 'Nativo' }] }));
  const updateLang = (id, key, val) => setData(p => ({ ...p, languages: p.languages.map(x => x.id === id ? { ...x, [key]: val } : x) }));
  const removeLang = id => setData(p => ({ ...p, languages: p.languages.filter(x => x.id !== id) }));

  const addSkill = () => {
    if (!skillInput.trim()) return;
    const items = skillInput.split(',').map(s => s.trim()).filter(Boolean);
    setData(p => ({ ...p, skills: [...p.skills, ...items] }));
    setSkillInput('');
  };
  const removeSkill = i => setData(p => { const newSkills = [...p.skills]; newSkills.splice(i, 1); return { ...p, skills: newSkills } });

  return (
    <div className="cv-builder-root" style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>

      {/* FRONTEND ISOLATED EDITOR FULL WIDTH */}
      <div className="mobile-main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOP HEADER */}
        <div className="mobile-header-toolbar mobile-p-10" style={{ padding: '16px 32px', background: 'var(--bg-surface-glass)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div className="mobile-full-width mobile-gap-10" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '0', fontSize: '14px', fontWeight: 'bold' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Voltar
            </button>
            <div style={{ width: '1px', height: '24px', background: 'var(--border-strong)', margin: '0 4px' }}></div>
            <h2 className="outfit gradient-text" style={{ margin: 0, fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>CurrículoStudio</h2>
          </div>
          <div className="mobile-wrap" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select value={lang} onChange={e => setLang(e.target.value)} style={{ ...inputStyle, width: 'auto', margin: 0, fontWeight: 'bold' }}>
              <option value="pt">🇵🇹 PT</option>
              <option value="en">🇬🇧 EN</option>
            </select>
            <select value={template} onChange={e => setTemplate(Number(e.target.value))} style={{ ...inputStyle, width: 'auto', margin: 0 }}>
              <option value={1}>1. Clássico Azul</option>
              <option value={2}>2. Moderno Verde</option>
              <option value={3}>3. Elegante Roxo</option>
              <option value={4}>4. Minimalista Vermelho</option>
              <option value={5}>5. Tecnológico Teal</option>
              <option value={6}>6. Editorial Sépia</option>
              <option value={7}>7. Corporativo</option>
              <option value={8}>8. Modelo Moçambique Oficial</option>
              <option value={9}>9. Criativo Vibrante</option>
              <option value={10}>10. Executivo Premium</option>
              <option value={11}>11. Moderno Bicolor</option>
              <option value={12}>12. Minimalista Executivo</option>
              <option value={13}>13. Profissional Dinâmico</option>
            </select>
            <button className="btn-secondary" onClick={() => setShowAiModal(true)} style={{ padding: '10px 18px', fontSize: '13px' }}>✦ Importar</button>
            <button className="btn-secondary" onClick={handleAiReview} style={{ padding: '10px 18px', fontSize: '13px', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>👁 Auto-Rever & Ver</button>
            <button className="btn-primary" onClick={handlePdfDownload} style={{ padding: '10px 18px', fontSize: '13px' }}>⬇ Baixar PDF</button>
          </div>
        </div>

        {/* TABS MENU */}
        <div className="mobile-tabs" style={{ display: 'flex', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px', overflowX: 'auto', gap: '8px' }}>
          {['pessoais', 'perfil', 'experiencia', 'formacao', 'cursos', 'competencias', 'idiomas'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '16px 20px', background: 'none', border: 'none', color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: activeTab === tab ? 700 : 500, cursor: 'pointer', borderBottom: activeTab === tab ? `3px solid var(--accent-primary)` : '3px solid transparent', textTransform: 'capitalize', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              {tab === 'perfil' ? 'Perfil Pessoal' : tab}
            </button>
          ))}
        </div>

        {/* EDITOR AREA CENTRADO */}
        <div className="mobile-editor-container" style={{ flex: 1, overflowY: 'auto', padding: '40px 24px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div className="glass-panel mobile-editor-card" style={{ width: '100%', maxWidth: '1000px', padding: '40px 64px' }}>

            {activeTab === 'pessoais' && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <label style={labelStyle}>Foto de Perfil</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ ...inputStyle, padding: '8px 12px', flex: 1, marginBottom: 0 }} />
                    {data.photo && (
                      <button 
                        onClick={() => setData({ ...data, photo: null })}
                        style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        ❌ Remover
                      </button>
                    )}
                  </div>
                </div>

                <label style={labelStyle}>Nome Completo</label>
                <input type="text" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} style={inputStyle} />

                <label style={labelStyle}>Cargo / Título</label>
                <input type="text" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} style={inputStyle} />

                <div className="mobile-flex-col" style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}><label style={labelStyle}>E-mail</label><input type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} style={inputStyle} /></div>
                  <div style={{ flex: 1 }}><label style={labelStyle}>Telefone</label><input type="text" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} style={inputStyle} /></div>
                </div>

                <div className="mobile-flex-col" style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}><label style={labelStyle}>Morada / Cidade</label><input type="text" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} style={inputStyle} /></div>
                  <div style={{ flex: 1 }}><label style={labelStyle}>LinkedIn</label><input type="text" value={data.linkedin} onChange={e => setData({ ...data, linkedin: e.target.value })} style={inputStyle} /></div>
                </div>

                {template === 8 && (
                  <div className="mobile-p-20" style={{ border: '2px dashed var(--border-strong)', padding: '20px', borderRadius: '12px', marginTop: '16px', background: 'var(--bg-surface)' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '800' }}>Campos Exclusivos (Moçambique)</h4>
                    <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div><label style={labelStyle}>Nacionalidade</label><input type="text" value={data.nacionalidade} onChange={e => setData({ ...data, nacionalidade: e.target.value })} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Data Nascimento</label><input type="text" value={data.dataNascimento} onChange={e => setData({ ...data, dataNascimento: e.target.value })} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Estado Civil</label><input type="text" value={data.estadoCivil} onChange={e => setData({ ...data, estadoCivil: e.target.value })} style={inputStyle} /></div>
                      <div><label style={labelStyle}>B.I. / NUIT</label><input type="text" value={data.bi} onChange={e => setData({ ...data, bi: e.target.value })} style={inputStyle} /></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'perfil' && (
              <div>
                <label style={labelStyle}>Perfil Pessoal / Resumo Profissional</label>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Escreva um breve resumo sobre quem você é profissionalmente, os seus objetivos e o que o destaca.</p>
                <textarea value={data.summary} onChange={e => setData({ ...data, summary: e.target.value })} style={{ ...inputStyle, height: '180px', resize: 'vertical' }} placeholder="Sou um profissional focado em..." />
              </div>
            )}

            {activeTab === 'experiencia' && (
              <div>
                {data.experiences.map(e => (
                  <div key={e.id} style={cardStyle}>
                    <button onClick={() => removeExp(e.id)} style={removeBtnStyle}>×</button>
                    <label style={labelStyle}>Cargo</label><input type="text" value={e.role} onChange={ev => updateExp(e.id, 'role', ev.target.value)} style={inputStyle} />
                    <label style={labelStyle}>Empresa</label><input type="text" value={e.company} onChange={ev => updateExp(e.id, 'company', ev.target.value)} style={inputStyle} />
                    <label style={labelStyle}>Período</label><input type="text" value={e.period} onChange={ev => updateExp(e.id, 'period', ev.target.value)} style={inputStyle} />
                    <label style={labelStyle}>Descrição</label><textarea value={e.desc} onChange={ev => updateExp(e.id, 'desc', ev.target.value)} style={{ ...inputStyle, height: '80px' }} />
                  </div>
                ))}
                <button onClick={addExp} style={addBtnStyle}>+ Adicionar Experiência</button>
              </div>
            )}

            {activeTab === 'formacao' && (
              <div>
                {data.educations.map(e => (
                  <div key={e.id} style={cardStyle}>
                    <button onClick={() => removeEdu(e.id)} style={removeBtnStyle}>×</button>
                    <label style={labelStyle}>Grau / Título</label><input type="text" value={e.degree} onChange={ev => updateEdu(e.id, 'degree', ev.target.value)} style={inputStyle} />
                    <label style={labelStyle}>Instituição</label><input type="text" value={e.institution} onChange={ev => updateEdu(e.id, 'institution', ev.target.value)} style={inputStyle} />
                    <label style={labelStyle}>Período</label><input type="text" value={e.period} onChange={ev => updateEdu(e.id, 'period', ev.target.value)} style={inputStyle} />
                  </div>
                ))}
                <button onClick={addEdu} style={addBtnStyle}>+ Adicionar Formação</button>
              </div>
            )}

            {activeTab === 'cursos' && (
              <div>
                {data.courses.map(c => (
                  <div key={c.id} style={cardStyle}>
                    <button onClick={() => removeCourse(c.id)} style={removeBtnStyle}>×</button>
                    <label style={labelStyle}>Nome do Curso / Certificação</label><input type="text" value={c.name} onChange={ev => updateCourse(c.id, 'name', ev.target.value)} style={inputStyle} />
                    <label style={labelStyle}>Instituição</label><input type="text" value={c.institution} onChange={ev => updateCourse(c.id, 'institution', ev.target.value)} style={inputStyle} />
                    <label style={labelStyle}>Ano</label><input type="text" value={c.year} onChange={ev => updateCourse(c.id, 'year', ev.target.value)} style={inputStyle} />
                  </div>
                ))}
                <button onClick={addCourse} style={addBtnStyle}>+ Adicionar Curso</button>
              </div>
            )}

            {activeTab === 'competencias' && (
              <div>
                <label style={labelStyle}>Adicionar Competências (Pressione Enter ou use ,)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() } }} style={{ ...inputStyle, marginBottom: 0 }} placeholder="Redes, Gestão..." />
                  <button onClick={addSkill} style={{ background: 'var(--border-strong)', color: 'var(--text-primary)', border: 'none', borderRadius: '10px', padding: '0 20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>+</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {data.skills.map((s, i) => (
                    <div key={i} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}>
                      {s} <button onClick={() => removeSkill(i)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'idiomas' && (
              <div>
                {data.languages.map(l => (
                  <div key={l.id} className="mobile-flex-col" style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'flex-start' }}>
                    <div className="mobile-full-width" style={{ flex: 1 }}><label style={labelStyle}>Idioma</label><input type="text" value={l.name} onChange={ev => updateLang(l.id, 'name', ev.target.value)} style={inputStyle} /></div>
                    <div className="mobile-full-width" style={{ width: '130px' }}><label style={labelStyle}>Nível</label><select value={l.level} onChange={ev => updateLang(l.id, 'level', ev.target.value)} style={inputStyle}>
                      {['Nativo', 'Fluente', 'Avançado', 'Intermediário', 'Básico'].map(lv => <option key={lv}>{lv}</option>)}
                    </select></div>
                    <div style={{ paddingTop: '22px' }}><button onClick={() => removeLang(l.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '24px' }}>&times;</button></div>
                  </div>
                ))}
                <button onClick={addLang} style={addBtnStyle}>+ Adicionar Idioma</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL SCREEN PREVIEW & AI REVIEW MODAL */}
      {showPreview && (
        <div className="mobile-preview-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', zIndex: 9999 }}>
          <div className="mobile-header-toolbar mobile-p-10" style={{ padding: '16px 24px', background: 'var(--bg-surface)', borderBottom: `1px solid var(--border-subtle)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-primary)' }}>✦</span> Auditoria de IA & Visualização
            </h3>
            <div className="mobile-wrap" style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-primary" onClick={handlePdfDownload} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px' }}>⬇ Baixar PDF Final</button>
              <button className="btn-secondary" onClick={() => setShowPreview(false)} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px' }}>✕ Fechar Tudo</button>
            </div>
          </div>

          <div className="mobile-flex-col" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            
            {/* AI REVIEW PANEL (LEFT COL) */}
            <div className="custom-scrollbar mobile-full-width" style={{ width: '400px', maxWidth: '100%', background: 'var(--bg-base)', borderRight: '1px solid var(--border-subtle)', overflowY: 'auto', padding: '32px' }}>
              <div className="premium-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h4 className="outfit" style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Auditoria de Especialista
                </h4>
                
                {reviewLoading ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    <div style={{ marginBottom: '12px', animation: 'pulse 1.5s infinite' }}>A analisar minuciosamente o teu CV...</div>
                  </div>
                ) : reviewData ? (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '24px' }}>
                      <span className="outfit gradient-text" style={{ fontSize: '48px', fontWeight: '900', lineHeight: 1 }}>{reviewData.score || '85'}</span>
                      <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>/ 100 PTS</span>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: '#10b981', marginBottom: '12px', letterSpacing: '0.5px' }}>✓ PONTOS FORTES</p>
                      <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                        {(reviewData.pontos_fortes || ['Design Limpo','O teu nome está bem destacado.']).map((pt, i) => (
                          <li key={i} style={{ marginBottom: '8px' }}>{pt}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '12px', letterSpacing: '0.5px' }}>⚠ SUGESTÕES DE MELHORIA</p>
                      <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                        {(reviewData.melhorias || ['Adiciona mais competências técnicas.']).map((pt, i) => (
                          <li key={i} style={{ marginBottom: '8px' }}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px' }}>
                    Modo offline. Análise rápida indisponível sem login/API no Backend.
                  </div>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center' }}>Faz edições no modo normal, e depois volta aqui para veres o resultado!</p>
            </div>

            {/* PREVIEW PANEL (RIGHT COL) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', justifyContent: 'center', background: 'var(--bg-surface)' }} onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}>
              <div style={{ width: 'max-content' }}>
                <div
                  ref={pdfRef}
                  style={{ width: '794px', minHeight: '1123px', background: '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', transition: 'transform 0.3s ease' }}
                  dangerouslySetInnerHTML={{ __html: renderCV(template, data, lang) }}
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* OFFLINE / AI IMPORT MODAL */}
      {showAiModal && (
        <div className="mobile-import-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="mobile-p-20" style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '600px', border: `1px solid var(--border-subtle)`, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 12px 0' }}>Importação Rápida de Currículo</h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', padding: '4px', borderRadius: '8px' }}>
              <button onClick={() => setUseAi(true)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: useAi ? 'var(--bg-surface)' : 'transparent', color: useAi ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: useAi ? 'bold' : 'normal', cursor: 'pointer', boxShadow: useAi ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}>✨ Agente IA (Recomendado)</button>
              <button onClick={() => setUseAi(false)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: !useAi ? 'var(--bg-surface)' : 'transparent', color: !useAi ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: !useAi ? 'bold' : 'normal', cursor: 'pointer', boxShadow: !useAi ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}>⚡ Offline (Básico)</button>
            </div>

            {useAi ? (
              <div style={{ marginBottom: '16px', animation: 'fadeIn 0.3s ease' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' }}>O Agente IA lê o texto desestruturado usando a sua inteligência, converte, e preenche impecavelmente <b>todos</b> os campos do formulário por si.<br />
                  Para usar esta magia gratuitamente necessita de uma <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>Google Gemini API Key</a>.</p>
                <input type="password" value={apiKey} onChange={e => { setApiKey(e.target.value); localStorage.setItem('gemini_api_key', e.target.value); }} placeholder="Cole a sua API Key do Gemini (sk-...)" style={{ ...inputStyle, marginBottom: '12px', borderColor: '#3b82f6' }} />

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500', background: 'var(--bg-base)', padding: '12px', borderRadius: '8px', border: `1px solid var(--border-strong)` }}>
                  <input type="checkbox" checked={autoSummary} onChange={e => setAutoSummary(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#3b82f6', marginTop: '2px' }} />
                  Gerar Perfil Pessoal/Resumo Profissional focado em vender o meu perfil caso o CV não tenha um forte estruturado.
                </label>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px', lineHeight: '1.5', animation: 'fadeIn 0.3s ease' }}>O sistema offline tenta agrupar secções pelo texto bruto e procurar por Emails/Telefones via Regex. Vai exigir mais revisão manual após a extração.</p>
            )}

            <div className="mobile-flex-col" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input type="file" id="cv-file-upload" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileImport} />
              <button className="btn-secondary" disabled={aiLoading} onClick={() => document.getElementById('cv-file-upload').click()} style={{ padding: '10px 12px', fontSize: '13px', flex: 1 }}>
                📄 Selecionar Ficheiro (PDF / Word)
              </button>
            </div>

            <textarea
              value={aiText} onChange={e => setAiText(e.target.value)}
              placeholder="Após escolher um CV, o texto em bruto vai aparecer aqui. Também pode colar texto ou anotações diretamente..."
              style={{ width: '100%', height: '120px', background: 'var(--bg-base)', border: `1px solid var(--border-strong)`, color: 'var(--text-primary)', padding: '12px', borderRadius: '8px', outline: 'none', marginBottom: '16px', fontSize: '13px', resize: 'vertical' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowAiModal(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
              <button className="btn-primary" onClick={useAi ? handleAiImport : handleLocalImport} disabled={aiLoading || (useAi && (!apiKey || !aiText)) || (!useAi && !aiText)} style={{ padding: '10px 20px', fontSize: '13px', opacity: (aiLoading || (useAi && (!apiKey || !aiText)) || (!useAi && !aiText)) ? 0.5 : 1 }}>
                {aiLoading ? 'Processando...' : (useAi ? '✨ Extrair com IA' : 'Extrair Offline')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ALERT MODAL */}
      {alertMsg && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, animation: 'fadeIn 0.2s ease' }}>
          <div className="premium-card" style={{ padding: '32px 40px', maxWidth: '420px', width: '90%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 100000 }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-glow)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px', fontWeight: '500' }}>{alertMsg}</p>
            <button className="btn-primary" onClick={() => setAlertMsg(null)} style={{ padding: '12px 32px', fontSize: '14px', width: '100%' }}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT CONTAINER - ALWAYS RENDERED FOR WINDOW.PRINT TO WORK */}
      <div
        id="print-area"
        style={{ display: 'none' }}
        dangerouslySetInnerHTML={{ __html: renderCV(template, data, lang) }}
      />
    </div>
  );
};

export default CVBuilder;
