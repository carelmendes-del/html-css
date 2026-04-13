import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getToken, EMPTY_CV_DATA } from '../utils/api';

/**
 * Hook centralizado para gestão do estado do CV.
 * Encapsula: fetch, save manual, auto-save, localStorage, e CRUD de arrays.
 */
export default function useCVData(id) {
  const navigate = useNavigate();
  const [data, setData] = useState({ ...EMPTY_CV_DATA });
  const [cvId, setCvId] = useState(null);
  const [cvTitle, setCvTitle] = useState('Nome do Documento');
  const [template, setTemplate] = useState(1);
  const [lang, setLang] = useState('pt');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [alertMsg, setAlertMsg] = useState(null);
  const saveTimerRef = useRef(null);

  // ── Fetch or Reset on route change ──
  useEffect(() => {
    const fetchOrClear = async () => {
      if (id === 'new' || !id) {
        setData({ ...EMPTY_CV_DATA });
        setCvId(null);
        setCvTitle('Nome do Documento');
        localStorage.removeItem('cv_data');
        localStorage.removeItem('cv_current_id');
        localStorage.removeItem('cv_current_title');
      } else {
        try {
          const res = await api.get('/api/cvs');
          const found = res.data.find(c => String(c.id) === String(id));
          if (found) {
            setData(found.data);
            setCvId(found.id);
            setCvTitle(found.title);
            setTemplate(found.template || 1);
            setLang(found.lang || 'pt');
          } else {
            setAlertMsg("Documento não encontrado ou sem permissão.");
            navigate('/');
          }
        } catch (err) {
          console.error("Erro ao carregar CV:", err);
        }
      }
    };
    fetchOrClear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Local persistence ──
  useEffect(() => {
    if (data.name || data.email || data.summary || data.experiences.length > 0) {
      localStorage.setItem('cv_data', JSON.stringify(data));
      localStorage.setItem('cv_template', template);
      localStorage.setItem('cv_lang', lang);
      localStorage.setItem('cv_current_title', cvTitle);
      if (cvId) localStorage.setItem('cv_current_id', cvId);
    }
  }, [data, template, lang, cvTitle, cvId]);

  // ── Auto-save (debounced 3s) ──
  useEffect(() => {
    const token = getToken();
    if (!token || token === 'local-jwt-token') return;
    if (!data.name && !data.summary && data.experiences.length === 0) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const cvToSave = { ...data };
        delete cvToSave.photo;
        const titleToSave = cvTitle === 'Nome do Documento' && data.name ? `CV - ${data.name}` : cvTitle;
        setSaveStatus('saving');
        if (cvId) {
          await api.put(`/api/cvs/${cvId}`, { title: titleToSave, data: cvToSave });
        } else {
          const res = await api.post('/api/cvs', { title: titleToSave, data: cvToSave });
          setCvId(res.data.id);
          navigate(`/cv/${res.data.id}`, { replace: true });
        }
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('error');
        console.warn('Auto-save falhou:', err.message);
      }
    }, 3000);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // ── Manual save ──
  const handleManualSave = async () => {
    setSaveStatus('saving');
    try {
      const cvToSave = { ...data };
      delete cvToSave.photo;
      const titleToSave = cvTitle || (data.name ? `CV - ${data.name}` : 'CV Sem Título');
      if (cvId) {
        await api.put(`/api/cvs/${cvId}`, { title: titleToSave, data: cvToSave });
      } else {
        const res = await api.post('/api/cvs', { title: titleToSave, data: cvToSave });
        setCvId(res.data.id);
        navigate(`/cv/${res.data.id}`, { replace: true });
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
    }
  };

  // ── CRUD helpers ──
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

  const addSkill = (skillInput) => {
    if (!skillInput.trim()) return;
    const items = skillInput.split(',').map(s => s.trim()).filter(Boolean);
    setData(p => ({ ...p, skills: [...p.skills, ...items] }));
  };
  const removeSkill = i => setData(p => { const newSkills = [...p.skills]; newSkills.splice(i, 1); return { ...p, skills: newSkills }; });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setData(prev => ({ ...prev, photo: ev.target.result }));
      reader.readAsDataURL(file);
    }
  };

  return {
    data, setData, cvId, cvTitle, setCvTitle,
    template, setTemplate, lang, setLang,
    saveStatus, alertMsg, setAlertMsg,
    handleManualSave, handlePhotoUpload,
    // CRUD
    addExp, updateExp, removeExp,
    addEdu, updateEdu, removeEdu,
    addCourse, updateCourse, removeCourse,
    addLang, updateLang, removeLang,
    addSkill, removeSkill,
  };
}
