import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getToken = () => sessionStorage.getItem('token');

export const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

export const api = {
  get: (path) => axios.get(`${BASE_URL}${path}`, getAuthHeaders()),
  post: (path, data) => axios.post(`${BASE_URL}${path}`, data, getAuthHeaders()),
  put: (path, data) => axios.put(`${BASE_URL}${path}`, data, getAuthHeaders()),
  delete: (path) => axios.delete(`${BASE_URL}${path}`, getAuthHeaders()),
};

export const EMPTY_CV_DATA = {
  name: '', title: '', email: '', phone: '', location: '', linkedin: '',
  nacionalidade: '', dataNascimento: '', estadoCivil: '', bi: '', nuit: '', photo: null,
  summary: '',
  experiences: [], educations: [], courses: [], languages: [], skills: []
};

export const TEMPLATE_NAMES = {
  1: 'moderno', 2: 'cronologico', 3: 'funcional', 4: 'criativo',
  5: 'academico', 6: 'nao_tradicional', 7: 'minimalista', 8: 'infografico',
  9: 'hibrido', 10: 'executivo', 11: 'mocambicano'
};
