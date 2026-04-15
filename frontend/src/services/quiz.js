import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const flashcardService = {
  generateFlashcards: (wordIds) => api.post('/api/v1/flashcards/generate', wordIds),

  getAllFlashcards: (skip = 0, limit = 100) =>
    api.get('/api/v1/flashcards/', { params: { skip, limit } }),

  getFlashcard: (flashcardId) => api.get(`/api/v1/flashcards/${flashcardId}`),

  markFlashcardKnown: (flashcardId) =>
    api.post(`/api/v1/flashcards/${flashcardId}/known`),

  deleteFlashcard: (flashcardId) => api.delete(`/api/v1/flashcards/${flashcardId}`),
};

export const quizService = {
  createQuiz: (totalQuestions = 10) =>
    api.post('/api/v1/quiz/', { total_questions: totalQuestions }),

  getAllQuizzes: (skip = 0, limit = 100) =>
    api.get('/api/v1/quiz/', { params: { skip, limit } }),

  getQuiz: (quizId) => api.get(`/api/v1/quiz/${quizId}`),

  submitQuiz: (quizId, correctAnswers) =>
    api.post(`/api/v1/quiz/${quizId}/submit`, { correct_answers: correctAnswers }),

  recordWordProgress: (wordId, correct) =>
    api.post(`/api/v1/quiz/progress/${wordId}?correct=${correct}`),

  getWordProgress: (wordId) => api.get(`/api/v1/quiz/progress/${wordId}`),

  getUserStatistics: () => api.get('/api/v1/quiz/stats/overall'),
};
