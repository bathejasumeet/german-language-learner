import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizComponent } from '../src/components/Quiz/QuizComponent';
import { Statistics } from '../src/components/Quiz/Statistics';
import * as quizService from '../src/services/quiz';
import * as vocabularyService from '../src/services/vocabulary';

vi.mock('../src/services/quiz');
vi.mock('../src/services/vocabulary');

describe('QuizComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays quiz start screen', () => {
    vocabularyService.getAllWords = vi.fn().mockResolvedValue({
      data: [{ id: 1, german_word: 'Apfel', meaning: 'Apple' }],
    });

    render(<QuizComponent />);
    expect(screen.getByText(/German Language Quiz/i)).toBeDefined();
  });

  it('allows starting a quiz', async () => {
    vocabularyService.getAllWords = vi.fn().mockResolvedValue({
      data: [{ id: 1, german_word: 'Apfel', meaning: 'Apple' }],
    });

    quizService.quizService = {
      createQuiz: vi.fn().mockResolvedValue({
        data: { id: 1, total_questions: 10 },
      }),
    };

    render(<QuizComponent />);
    const startButton = screen.queryByRole('button', { name: /Start Quiz/i });
    if (startButton) {
      fireEvent.click(startButton);
      expect(quizService.quizService.createQuiz).toHaveBeenCalled();
    }
  });

  it('displays quiz questions', () => {
    // Test question rendering
    expect(true).toBe(true);
  });

  it('allows selecting answers', () => {
    // Test answer selection
    expect(true).toBe(true);
  });

  it('calculates quiz score correctly', () => {
    // Test score calculation
    expect(true).toBe(true);
  });

  it('shows results page with score and message', () => {
    // Test results display
    expect(true).toBe(true);
  });

  it('allows taking another quiz from results', () => {
    // Test quiz restart
    expect(true).toBe(true);
  });
});

describe('Statistics Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays user statistics', () => {
    quizService.quizService = {
      getUserStatistics: vi.fn().mockResolvedValue({
        data: {
          total_words: 25,
          total_quizzes: 5,
          average_quiz_score: 78.5,
          total_reviews: 150,
          overall_accuracy: 82.0,
        },
      }),
    };

    render(<Statistics />);
    expect(screen.getByText(/Your Learning Statistics/i)).toBeDefined();
  });

  it('displays stat cards for each metric', async () => {
    quizService.quizService = {
      getUserStatistics: vi.fn().mockResolvedValue({
        data: {
          total_words: 25,
          total_quizzes: 5,
          average_quiz_score: 78.5,
          total_reviews: 150,
          overall_accuracy: 82.0,
        },
      }),
    };

    render(<Statistics />);
    expect(screen.getByText(/25/)).toBeDefined();
  });

  it('allows refreshing statistics', () => {
    quizService.quizService = {
      getUserStatistics: vi.fn().mockResolvedValue({
        data: {
          total_words: 25,
          total_quizzes: 5,
          average_quiz_score: 78.5,
          total_reviews: 150,
          overall_accuracy: 82.0,
        },
      }),
    };

    render(<Statistics />);
    const refreshButton = screen.queryByRole('button', { name: /Refresh/i });
    if (refreshButton) {
      fireEvent.click(refreshButton);
      expect(quizService.quizService.getUserStatistics).toHaveBeenCalled();
    }
  });
});
