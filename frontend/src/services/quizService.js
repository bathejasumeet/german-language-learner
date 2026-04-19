import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const quizService = {
  // Generate a new quiz with specified number of questions
  generateQuiz: (count = 10) => api.get('/api/v1/quiz/generate', { params: { count } }),

  // Submit an answer and get feedback
  submitAnswer: (quizId, questionId, selectedOptionIndex) =>
    api.post('/api/v1/quiz/submit', {
      quiz_id: quizId,
      question_id: questionId,
      selected_option_index: selectedOptionIndex,
    }),

  // Complete quiz and get final score
  completeQuiz: (
    quizId,
    score,
    totalQuestions,
    vocabularyIds,
    results,
    durationSeconds
  ) =>
    api.post('/api/v1/quiz/complete', {
      quiz_id: quizId,
      score,
      total_questions: totalQuestions,
      vocabulary_ids: vocabularyIds,
      results,
      duration_seconds: durationSeconds,
    }),

  // Get quiz history for user
  getQuizHistory: (userId = 1, skip = 0, limit = 10) =>
    api.get('/api/v1/quiz/history', {
      params: { user_id: userId, skip, limit },
    }),

  // Get quiz statistics for user
  getQuizStatistics: (userId = 1) =>
    api.get('/api/v1/quiz/statistics', {
      params: { user_id: userId },
    }),
};
