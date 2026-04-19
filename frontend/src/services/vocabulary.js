import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const vocabularyService = {
  getAllWords: (skip = 0, limit = 100) =>
    api.get('/api/v1/words/', { params: { skip, limit } }),

  getWord: (wordId) => api.get(`/api/v1/words/${wordId}`),

  createWord: (germanWord, meaning, exampleSentence) => {
    const payload = {
      german_word: germanWord,
      meaning
    };
    if (exampleSentence) {
      payload.example_sentence = exampleSentence;
    }
    return api.post('/api/v1/words/', payload);
  },

  updateWord: (wordId, germanWord, meaning, exampleSentence) => {
    const payload = {};
    if (germanWord) {
      payload.german_word = germanWord;
    }
    if (meaning) {
      payload.meaning = meaning;
    }
    if (exampleSentence !== undefined) {
      payload.example_sentence = exampleSentence;
    }
    return api.put(`/api/v1/words/${wordId}`, payload);
  },

  deleteWord: (wordId) => api.delete(`/api/v1/words/${wordId}`),
};
