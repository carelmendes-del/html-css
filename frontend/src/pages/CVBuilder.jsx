import React, { useState, useRef } from 'react';
import { renderCV } from '../components/CVRenderer';
import '../components/CVRenderer.css';
import html2pdf from 'html2pdf.js';
import axios from 'axios';

const CVBuilder = () => {
  const [data, setData] = useState({
    name: '', title: '', email: '', phone: '', location: '', linkedin: '',
    nacionalidade: '', dataNascimento: '', estadoCivil: '', bi: '', photo: null,
    summary: '',
    experiences: [], educations: [], courses: [], languages: [], skills: []
  });

  const [template, setTemplate] = useState(1);
  const [activeTab, setActiveTab] = useState('pessoais');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [theme, setTheme] = useState('dark');
  const [showPreview, setShowPreview] = useState(false);
  const pdfRef = useRef(null);

  const colors = theme === 'dark' 
    ? { bg1: '#09090b', bg2: '#18181b', border: '#27272a', text1: '#fafafa', text2: '#a1a1aa', btnBg: '#fafafa', btnText: '#09090b' }
    : { bg1: '#f4f4f5', bg2: '#ffffff', border: '#e4e4e7', text1: '#09090b', text2: '#52525b', btnBg: '#09090b', btnText: '#fafafa' };

  const shadow = theme === 'light' ? '0 4px 15px rgba(0,0,0,0.03)' : '0 4px 15px rgba(0,0,0,0.4)';
  const inputStyle = { width: '100%', padding: '12px 16px', marginBottom: '14px', background: colors.bg1, border: `1px solid ${colors.border}`, borderRadius: '10px', color: colors.text1, fontSize: '13px', outline: 'none', transition: 'border 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' };
  const labelStyle = { display: 'block', fontSize: '11px', color: colors.text2, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' };
  const cardStyle = { background: colors.bg2, border: `1px solid ${colors.border}`, padding: '24px', borderRadius: '14px', marginBottom: '16px', position: 'relative', boxShadow: shadow };
  const removeBtnStyle = { position: 'absolute', top: '12px', right: '12px', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' };
  const addBtnStyle = { width: '100%', padding: '14px', border: `2px dashed ${colors.border}`, background: 'none', color: colors.text2, borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' };

  const handlePdfDownload = () => {
    const opt = {
      margin: 0,
      filename: `${data.name.replace(/\\s+/g, '_') || 'Curriculo'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    html2pdf().set(opt).from(pdfRef.current).save();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setData({ ...data, photo: ev.target.result });
      reader.readAsDataURL(file);
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
      alert('Importação Offline concluída! \nComo este modo não usa Inteligência Artificial, a organização final depende de revisão manual.');
    } catch (err) {
      alert("Erro ao processar o texto localmente.");
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
        alert("Formato não suportado. Use um ficheiro PDF ou Word (.docx).");
        setAiText('');
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao extrair o texto do arquivo.");
      setAiText('');
    } finally {
      setAiLoading(false);
      e.target.value = '';
    }
  };

  // ARR MGT
  const addExp = () => setData(p => ({ ...p, experiences: [...p.experiences, { id: Date.now(), role: '', company: '', period: '', desc: '' }]}));
  const updateExp = (id, key, val) => setData(p => ({ ...p, experiences: p.experiences.map(x => x.id === id ? { ...x, [key]: val } : x) }));
  const removeExp = id => setData(p => ({ ...p, experiences: p.experiences.filter(x => x.id !== id) }));

  const addEdu = () => setData(p => ({ ...p, educations: [...p.educations, { id: Date.now(), degree: '', institution: '', period: '' }]}));
  const updateEdu = (id, key, val) => setData(p => ({ ...p, educations: p.educations.map(x => x.id === id ? { ...x, [key]: val } : x) }));
  const removeEdu = id => setData(p => ({ ...p, educations: p.educations.filter(x => x.id !== id) }));

  const addCourse = () => setData(p => ({ ...p, courses: [...p.courses, { id: Date.now(), name: '', institution: '', year: '' }]}));
  const updateCourse = (id, key, val) => setData(p => ({ ...p, courses: p.courses.map(x => x.id === id ? { ...x, [key]: val } : x) }));
  const removeCourse = id => setData(p => ({ ...p, courses: p.courses.filter(x => x.id !== id) }));

  const addLang = () => setData(p => ({ ...p, languages: [...p.languages, { id: Date.now(), name: '', level: 'Nativo' }]}));
  const updateLang = (id, key, val) => setData(p => ({ ...p, languages: p.languages.map(x => x.id === id ? { ...x, [key]: val } : x) }));
  const removeLang = id => setData(p => ({ ...p, languages: p.languages.filter(x => x.id !== id) }));

  const addSkill = () => {
    if(!skillInput.trim()) return;
    const items = skillInput.split(',').map(s=>s.trim()).filter(Boolean);
    setData(p => ({ ...p, skills: [...p.skills, ...items] }));
    setSkillInput('');
  };
  const removeSkill = i => setData(p => { const newSkills = [...p.skills]; newSkills.splice(i, 1); return { ...p, skills: newSkills }});

  return (
    <div style={{ display: 'flex', height: '100vh', background: colors.bg1, fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      
      {/* FRONTEND ISOLATED EDITOR FULL WIDTH */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* TOP HEADER */}
        <div className="mobile-header-toolbar mobile-p-10" style={{ padding: '16px 32px', background: colors.bg2, borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div className="mobile-full-width mobile-gap-10" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <h2 style={{ margin: 0, color: colors.text1, fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>CurrículoStudio</h2>
             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'transparent', border: `1px solid ${colors.border}`, color: colors.text1, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                {theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
             </button>
          </div>
          <div className="mobile-wrap" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select value={template} onChange={e => setTemplate(Number(e.target.value))} style={{...inputStyle, width: 'auto', margin: 0}}>
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
            </select>
            <button onClick={() => setShowAiModal(true)} style={{ background: 'transparent', border: `1px solid ${colors.border}`, color: colors.text1, padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>✦ Importar CV</button>
            <button onClick={() => setShowPreview(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>👁 Visualizar CV</button>
            <button onClick={handlePdfDownload} style={{ background: colors.btnBg, color: colors.btnText, border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: theme === 'light' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none' }}>⬇ Baixar PDF</button>
          </div>
        </div>

        {/* TABS MENU */}
        <div className="mobile-tabs" style={{ display: 'flex', background: colors.bg2, borderBottom: `1px solid ${colors.border}`, padding: '0 24px', overflowX: 'auto' }}>
          {['pessoais', 'perfil', 'experiencia', 'formacao', 'cursos', 'competencias', 'idiomas'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '14px 20px', background: 'none', border: 'none', color: activeTab === tab ? colors.text1 : colors.text2, fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', borderBottom: activeTab === tab ? `2px solid ${colors.text1}` : '2px solid transparent', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
              {tab === 'perfil' ? 'Perfil Pessoal' : tab}
            </button>
          ))}
        </div>

        {/* EDITOR AREA CENTRADO */}
        <div className="mobile-editor-container" style={{ flex: 1, overflowY: 'auto', padding: '40px 24px', display: 'flex', justifyContent: 'center' }}>
          <div className="mobile-editor-card" style={{ width: '100%', maxWidth: '820px', background: colors.bg2, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '36px', boxShadow: theme === 'light' ? '0 20px 40px -10px rgba(0,0,0,0.06)' : '0 20px 40px -10px rgba(0,0,0,0.4)' }}>
            
            {activeTab === 'pessoais' && (
              <div>
                <label style={labelStyle}>Foto de Perfil</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ ...inputStyle, padding: '6px' }} />
                
                <label style={labelStyle}>Nome Completo</label>
                <input type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})} style={inputStyle} />
                
                <label style={labelStyle}>Cargo / Título</label>
                <input type="text" value={data.title} onChange={e => setData({...data, title: e.target.value})} style={inputStyle} />
                
                <div className="mobile-flex-col" style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}><label style={labelStyle}>E-mail</label><input type="email" value={data.email} onChange={e => setData({...data, email: e.target.value})} style={inputStyle} /></div>
                  <div style={{ flex: 1 }}><label style={labelStyle}>Telefone</label><input type="text" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} style={inputStyle} /></div>
                </div>

                <div className="mobile-flex-col" style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}><label style={labelStyle}>Morada / Cidade</label><input type="text" value={data.location} onChange={e => setData({...data, location: e.target.value})} style={inputStyle} /></div>
                  <div style={{ flex: 1 }}><label style={labelStyle}>LinkedIn</label><input type="text" value={data.linkedin} onChange={e => setData({...data, linkedin: e.target.value})} style={inputStyle} /></div>
                </div>

                {template === 8 && (
                  <div className="mobile-p-20" style={{ border: `2px dashed ${colors.border}`, padding: '20px', borderRadius: '12px', marginTop: '16px', background: theme === 'light' ? '#f8fafc' : '#1e293b' }}>
                    <h4 style={{ fontSize: '13px', color: colors.text2, marginBottom: '12px', fontWeight: '800' }}>Campos Exclusivos (Moçambique)</h4>
                    <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div><label style={labelStyle}>Nacionalidade</label><input type="text" value={data.nacionalidade} onChange={e => setData({...data, nacionalidade: e.target.value})} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Data Nascimento</label><input type="text" value={data.dataNascimento} onChange={e => setData({...data, dataNascimento: e.target.value})} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Estado Civil</label><input type="text" value={data.estadoCivil} onChange={e => setData({...data, estadoCivil: e.target.value})} style={inputStyle} /></div>
                      <div><label style={labelStyle}>B.I. / NUIT</label><input type="text" value={data.bi} onChange={e => setData({...data, bi: e.target.value})} style={inputStyle} /></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'perfil' && (
              <div>
                <label style={labelStyle}>Perfil Pessoal / Resumo Profissional</label>
                <p style={{ fontSize: '12px', color: colors.text2, marginBottom: '12px' }}>Escreva um breve resumo sobre quem você é profissionalmente, os seus objetivos e o que o destaca.</p>
                <textarea value={data.summary} onChange={e => setData({...data, summary: e.target.value})} style={{...inputStyle, height: '180px', resize: 'vertical'}} placeholder="Sou um profissional focado em..." />
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
                    <label style={labelStyle}>Descrição</label><textarea value={e.desc} onChange={ev => updateExp(e.id, 'desc', ev.target.value)} style={{...inputStyle, height: '80px'}} />
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
                  <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => {if(e.key === 'Enter' || e.key === ','){e.preventDefault(); addSkill()}}} style={{...inputStyle, marginBottom: 0}} placeholder="Redes, Gestão..." />
                  <button onClick={addSkill} style={{ background: colors.border, color: colors.text1, border: 'none', borderRadius: '10px', padding: '0 20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>+</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {data.skills.map((s, i) => (
                    <div key={i} style={{ background: colors.border, color: colors.text1, padding: '8px 16px', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}>
                      {s} <button onClick={() => removeSkill(i)} style={{ background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '14px', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
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

      {/* FULL SCREEN PREVIEW MODAL */}
      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', zIndex: 9999 }}>
          <div className="mobile-header-toolbar mobile-p-10" style={{ padding: '16px 24px', background: colors.bg2, borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <h3 style={{ color: colors.text1, margin: 0, fontSize: '16px' }}>👁 Modo de Visualização</h3>
            <div className="mobile-wrap" style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handlePdfDownload} style={{ background: colors.btnBg, color: colors.btnText, border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>⬇ Baixar PDF</button>
              <button onClick={() => setShowPreview(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>✕ Fechar</button>
            </div>
          </div>
          
          <button onClick={() => setShowPreview(false)} style={{ position: 'absolute', top: '80px', right: '30px', background: '#ef4444', color: '#fff', border: 'none', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

          <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', justifyContent: 'center' }} onClick={(e) => { if(e.target === e.currentTarget) setShowPreview(false); }}>
            <div style={{ width: 'max-content' }}>
              <div 
                ref={pdfRef}
                style={{ width: '794px', minHeight: '1123px', background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                dangerouslySetInnerHTML={{ __html: renderCV(template, data) }}
              />
            </div>
          </div>
        </div>
      )}

      {/* OFFLINE IMPORT MODAL */}
      {showAiModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="mobile-p-20" style={{ background: colors.bg2, padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '600px', border: `1px solid ${colors.border}` }}>
            <h3 style={{ color: colors.text1, margin: '0 0 12px 0' }}>Importação Rápida de Ficheiro</h3>
            <p style={{ color: colors.text2, fontSize: '13px', marginBottom: '16px' }}>O sistema procurará Emails, Telefones, e tentará separar as secções automaticamente no seu próprio computador (100% Offline e Sem APIs!).</p>
            
            <div className="mobile-flex-col" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input type="file" id="cv-file-upload" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileImport} />
              <button disabled={aiLoading} onClick={() => document.getElementById('cv-file-upload').click()} style={{ background: colors.btnBg, color: colors.btnText, border: 'none', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', flex: 1, fontWeight: '700' }}>
                📄 Selecionar Ficheiro (PDF / Word)
              </button>
            </div>

            <textarea 
              value={aiText} onChange={e => setAiText(e.target.value)}
              placeholder="Ou cole aqui o texto do seu Currículo diretamente..."
              style={{ width: '100%', height: '160px', background: colors.bg1, border: `1px solid ${colors.border}`, color: colors.text1, padding: '12px', borderRadius: '8px', outline: 'none', marginBottom: '16px', fontSize: '13px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowAiModal(false)} style={{ background: 'transparent', color: colors.text2, border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
              <button onClick={handleLocalImport} disabled={aiLoading} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                {aiLoading ? 'Processando...' : 'Extrair Offline Agora'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CVBuilder;
