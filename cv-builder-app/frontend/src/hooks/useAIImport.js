import { useState } from 'react';
import { api, getToken, TEMPLATE_NAMES } from '../utils/api';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/**
 * Hook for AI-powered and offline CV import functionality.
 * Extracts ~180 lines of logic from CVBuilder.jsx.
 */
export default function useAIImport({ data, setData, template, setAlertMsg }) {
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [useAi, setUseAi] = useState(true);
  const [autoSummary, setAutoSummary] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // ── AI Review ──
  const handleAiReview = async () => {
    setShowPreview(true);
    if (!reviewData) {
      setReviewLoading(true);
      try {
        const token = getToken();
        if (!token || token === 'local-jwt-token') {
          setAlertMsg('Sessão inválida. Faça logout e login novamente para usar a auditoria de IA.');
          setReviewLoading(false);
          return;
        }
        const cvToReview = { ...data };
        delete cvToReview.photo;
        const res = await api.post('/api/ai/review', { cvGerado: cvToReview });
        setReviewData(res.data);
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 401) {
          setAlertMsg('Sessão expirada ou inválida (401). Faça logout (Sair) e entre novamente.');
        } else {
          setAlertMsg('Falha ao obter conselhos de IA. Verifique se o backend está ligado.');
        }
      } finally {
        setReviewLoading(false);
      }
    }
  };

  // ── Transform AI response into CV data (null-safe merge) ──
  const transformAiData = (rawJson, currentState) => {
    const addIds = (arr) => (Array.isArray(arr) ? arr.map((item, i) => ({ ...item, id: Date.now() + i })) : []);
    return {
      name: rawJson.name || currentState.name,
      title: rawJson.title || currentState.title,
      email: rawJson.email || currentState.email,
      phone: rawJson.phone || currentState.phone,
      location: rawJson.location || currentState.location,
      linkedin: rawJson.linkedin || currentState.linkedin,
      summary: rawJson.summary || currentState.summary,
      experiences: Array.isArray(rawJson.experiences) && rawJson.experiences.length ? addIds(rawJson.experiences) : currentState.experiences,
      educations: Array.isArray(rawJson.educations) && rawJson.educations.length ? addIds(rawJson.educations) : currentState.educations,
      courses: Array.isArray(rawJson.courses) && rawJson.courses.length ? addIds(rawJson.courses) : currentState.courses,
      languages: Array.isArray(rawJson.languages) && rawJson.languages.length ? addIds(rawJson.languages) : currentState.languages,
      skills: Array.isArray(rawJson.skills) && rawJson.skills.length ? rawJson.skills : currentState.skills,
    };
  };

  // ── AI Import ──
  const handleAiImport = async () => {
    if (!aiText || aiText.length < 20) {
      setAlertMsg("Por favor, cole o texto do currículo para uma extração precisa.");
      return;
    }
    setAiLoading(true);
    try {
      const response = await api.post('/api/ai/import', {
        text: aiText,
        autoSummary,
        modelId: TEMPLATE_NAMES[template] || 'moderno'
      });
      const parsed = response.data;
      if (!parsed) throw new Error("A IA comunicou com sucesso, mas não encontrou dados válidos.");

      setData(prev => {
        const merged = transformAiData(parsed, prev);
        localStorage.setItem('cv_data', JSON.stringify(merged));
        return merged;
      });
      setShowAiModal(false);
      setAiText('');
      setAlertMsg('✨ Importação IA concluída! Os seus dados foram organizados nas respetivas secções.');
    } catch (err) {
      console.error('AI Import Error:', err);
      const msg = err.response?.data?.error || err.message;
      setAlertMsg(`Erro no processamento IA: ${msg}`);
    } finally {
      setAiLoading(false);
    }
  };

  // ── Offline Import (Regex-based) ──
  const handleLocalImport = () => {
    setAiLoading(true);
    try {
      const text = aiText;
      const extracted = {
        name: '', title: '', email: '', phone: '', summary: '',
        experiences: [], educations: [], courses: [], languages: [], skills: []
      };

      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) extracted.email = emailMatch[0];

      const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
      if (phoneMatch) extracted.phone = phoneMatch[0];

      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) extracted.name = lines[0].substring(0, 50);
      if (lines.length > 1 && !lines[1].includes('@') && lines[1].length < 60) {
        extracted.title = lines[1];
      }

      const lower = text.toLowerCase();
      const getBlock = (startWords, endWords) => {
        let startIdx = -1;
        for (const w of startWords) { startIdx = lower.indexOf(w); if (startIdx !== -1) break; }
        if (startIdx === -1) return '';
        let endIdx = text.length;
        for (const w of endWords) { const idx = lower.indexOf(w, startIdx + 15); if (idx !== -1 && idx < endIdx) endIdx = idx; }
        return text.substring(startIdx, endIdx).split('\n').slice(1).join('\n').trim();
      };

      const expText = getBlock(['experiência', 'experiencia', 'histórico profissional', 'experience'], ['formação', 'educação', 'cursos', 'competências', 'idiomas']);
      if (expText) extracted.experiences.push({ id: Date.now(), role: 'Rever Cargo', company: '', period: '', desc: expText.substring(0, 600) });

      const eduText = getBlock(['formação', 'formacao', 'educação', 'habilitações'], ['experiência', 'cursos', 'competências', 'idiomas']);
      if (eduText) extracted.educations.push({ id: Date.now(), degree: 'Rever Formação', institution: eduText.substring(0, 80), period: '' });

      const skillsText = getBlock(['competências', 'competencias', 'skills', 'qualificações'], ['idiomas', 'cursos', 'experiência']);
      if (skillsText) extracted.skills = skillsText.split(/,|\n/).map(s => s.trim()).filter(s => s.length > 2 && s.length < 35).slice(0, 8);

      extracted.summary = "Dados extraídos localmente com sucesso. Por favor, reveja e edite cada campo para garantir a máxima precisão.";

      setData(prev => ({ ...prev, ...extracted }));
      setShowAiModal(false);
      setAlertMsg('Importação Offline concluída! \nComo este modo não usa Inteligência Artificial, a organização final depende de revisão manual.');
    } catch {
      setAlertMsg("Erro ao processar o texto localmente.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── File Import (PDF/Word) ──
  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAiLoading(true);
    setAiText('⏳ A ler o ficheiro... por favor aguarde.');
    try {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(s => s.str).join(' ') + '\n';
        }
        if (!text.trim()) throw new Error("Não foi possível extrair texto deste PDF (pode ser uma imagem).");
        setAiText(text);
      } else if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (!result.value.trim()) throw new Error("Não foi possível extrair texto deste documento Word.");
        setAiText(result.value);
      } else {
        setAlertMsg("Formato não suportado. Utilize um ficheiro PDF ou Word (.docx).");
        setAiText('');
      }
    } catch (err) {
      console.error('File Read Error:', err);
      setAlertMsg(`Erro ao ler o ficheiro: ${err.message}`);
      setAiText('');
    } finally {
      setAiLoading(false);
      e.target.value = '';
    }
  };

  return {
    showAiModal, setShowAiModal,
    aiText, setAiText, aiLoading, useAi, setUseAi,
    autoSummary, setAutoSummary,
    showPreview, setShowPreview,
    reviewData, reviewLoading,
    handleAiReview, handleAiImport, handleLocalImport, handleFileImport,
  };
}
