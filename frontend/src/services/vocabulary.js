import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const vocabularyService = {
  getAllWords: (skip = 0, limit = 100) =>
    api.get('/api/v1/words/', { params: { skip, limit } }),

  getWord: (wordId) => api.get(`/api/v1/words/${wordId}`),

  createWord: (germanWord, meaning) =>
    api.post('/api/v1/words/', { german_word: germanWord, meaning }),

  updateWord: (wordId, germanWord, meaning) =>
    api.put(`/api/v1/words/${wordId}`, {
      german_word: germanWord,
      meaning,
    }),

  deleteWord: (wordId) => api.delete(`/api/v1/words/${wordId}`),
};
