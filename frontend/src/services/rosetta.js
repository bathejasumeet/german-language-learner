import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const rosettaService = {
  /**
   * Generate (or retrieve cached) memory-aid sentences for a vocabulary word.
   * @param {number} wordId - The vocabulary word ID
   * @param {boolean} force  - If true, bypass the server cache and regenerate
   */
  generate: (wordId, force = false) =>
    api.post('/api/v1/rosetta/generate', { word_id: wordId, force }),
};
