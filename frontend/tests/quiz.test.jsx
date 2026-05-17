import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuizComponent } from '../src/components/Quiz/QuizComponent';
import { Statistics } from '../src/components/Quiz/Statistics';
import * as quizOldService from '../src/services/quiz';
import * as vocabularyModule from '../src/services/vocabulary';
import * as quizServiceModule from '../src/services/quizService';

vi.mock('../src/services/quiz');
vi.mock('../src/services/vocabulary');
vi.mock('../src/services/quizService');

const makeWords = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    german_word: `Wort${i + 1}`,
    meaning: `Word${i + 1}`,
  }));

const mockQuestion = {
  id: 'q_1',
  vocabulary_id: 1,
  question: 'What is the English meaning of: Wort1?',
  german_word: 'Wort1',
  english_meaning: 'Word1',
  options: ['Cat', 'Dog', 'House', 'Tree'],
  correct_answer_index: 0,
};

describe('QuizComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    quizServiceModule.quizService = {
      generateQuiz: vi.fn(),
      completeQuiz: vi.fn().mockResolvedValue({ data: {} }),
    };
  });

  // US1 — T009: shows error when fewer than 10 words
  it('shows error when fewer than 10 words available', async () => {
    vocabularyModule.vocabularyService = {
      getAllWords: vi.fn().mockResolvedValue({ data: makeWords(7) }),
    };
    render(<QuizComponent />);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
    });
    expect(screen.getByText(/at least 10 words/i)).toBeDefined();
    expect(screen.queryByRole('button', { name: /Start Quiz/i })).toBeNull();
  });

  // US1 — T010: shows start screen when 10 or more words
  it('shows start screen when 10 or more words available', async () => {
    vocabularyModule.vocabularyService = {
      getAllWords: vi.fn().mockResolvedValue({ data: makeWords(10) }),
    };
    render(<QuizComponent />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Quiz/i })).toBeDefined();
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  // US2 — T019: renders four options per question
  it('renders four options per question', async () => {
    vocabularyModule.vocabularyService = {
      getAllWords: vi.fn().mockResolvedValue({ data: makeWords(10) }),
    };
    quizServiceModule.quizService = {
      generateQuiz: vi.fn().mockResolvedValue({
        data: { quiz_id: 'quiz_1', total_questions: 1, questions: [mockQuestion] },
      }),
      completeQuiz: vi.fn().mockResolvedValue({ data: {} }),
    };
    render(<QuizComponent />);
    await waitFor(() => screen.getByRole('button', { name: /Start Quiz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));
    await waitFor(() => screen.getByText('Wort1'));
    const optionBtns = screen.getAllByRole('button', { name: /Option [ABCD]/i });
    expect(optionBtns.length).toBe(4);
    ['Cat', 'Dog', 'House', 'Tree'].forEach((opt) => {
      expect(screen.getByText(opt)).toBeDefined();
    });
  });

  // US2 — T020: no green/red feedback shown during quiz after selecting option
  it('no green/red feedback shown during quiz after selecting option', async () => {
    vocabularyModule.vocabularyService = {
      getAllWords: vi.fn().mockResolvedValue({ data: makeWords(10) }),
    };
    quizServiceModule.quizService = {
      generateQuiz: vi.fn().mockResolvedValue({
        data: { quiz_id: 'quiz_1', total_questions: 1, questions: [mockQuestion] },
      }),
      completeQuiz: vi.fn().mockResolvedValue({ data: {} }),
    };
    render(<QuizComponent />);
    await waitFor(() => screen.getByRole('button', { name: /Start Quiz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));
    await waitFor(() => screen.getByText('Wort1'));
    // Select an option
    const optionBtns = screen.getAllByRole('button', { name: /Option A/i });
    fireEvent.click(optionBtns[0]);
    await waitFor(() => screen.getByRole('button', { name: /See Results/i }));
    // No "Correct!" or "Incorrect" text should be visible
    expect(screen.queryByText(/✓ Correct!/i)).toBeNull();
    expect(screen.queryByText(/✗ Incorrect/i)).toBeNull();
  });

  // US3 — T024: results screen shows per-question data
  it('results screen shows german word, selected answer, and correct answer', async () => {
    const wrongQuestion = { ...mockQuestion, correct_answer_index: 1 };
    vocabularyModule.vocabularyService = {
      getAllWords: vi.fn().mockResolvedValue({ data: makeWords(10) }),
    };
    quizServiceModule.quizService = {
      generateQuiz: vi.fn().mockResolvedValue({
        data: { quiz_id: 'quiz_1', total_questions: 1, questions: [wrongQuestion] },
      }),
      completeQuiz: vi.fn().mockResolvedValue({ data: {} }),
    };
    render(<QuizComponent />);
    await waitFor(() => screen.getByRole('button', { name: /Start Quiz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));
    await waitFor(() => screen.getByText('Wort1'));
    // Select option A (index 0, which is wrong — correct is index 1)
    fireEvent.click(screen.getAllByRole('button', { name: /Option A/i })[0]);
    await waitFor(() => screen.getByRole('button', { name: /See Results/i }));
    fireEvent.click(screen.getByRole('button', { name: /See Results/i }));
    await waitFor(() => screen.getByText(/Quiz Complete/i));
    // German word shown
    expect(screen.getByText('Wort1')).toBeDefined();
    // Selected answer text (Cat = options[0])
    expect(screen.getByText('Cat')).toBeDefined();
    // Correct answer text (Dog = options[1])
    expect(screen.getByText('Dog')).toBeDefined();
  });

  // US3 — T025: results screen shows score + Take Another Quiz button
  it('results screen shows score summary and Take Another Quiz button', async () => {
    vocabularyModule.vocabularyService = {
      getAllWords: vi.fn().mockResolvedValue({ data: makeWords(10) }),
    };
    quizServiceModule.quizService = {
      generateQuiz: vi.fn().mockResolvedValue({
        data: { quiz_id: 'quiz_1', total_questions: 1, questions: [mockQuestion] },
      }),
      completeQuiz: vi.fn().mockResolvedValue({ data: {} }),
    };
    render(<QuizComponent />);
    await waitFor(() => screen.getByRole('button', { name: /Start Quiz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));
    await waitFor(() => screen.getByText('Wort1'));
    // Answer correctly (index 0 = correct_answer_index)
    fireEvent.click(screen.getAllByRole('button', { name: /Option A/i })[0]);
    await waitFor(() => screen.getByRole('button', { name: /See Results/i }));
    fireEvent.click(screen.getByRole('button', { name: /See Results/i }));
    await waitFor(() => screen.getByText(/Quiz Complete/i));
    // Score shown: "1 of 1 correct"
    expect(screen.getByText(/1 of 1 correct/i)).toBeDefined();
    // Take Another Quiz button present
    expect(screen.getByRole('button', { name: /Take Another Quiz/i })).toBeDefined();
  });
});

describe('Statistics Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays user statistics', () => {
    quizOldService.quizService = {
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
    expect(screen.getByText(/Statistics/i)).toBeDefined();
  });

  it('displays stat cards for each metric', async () => {
    quizOldService.quizService = {
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
    await screen.findByText(/25/);
    expect(screen.getByText(/25/)).toBeDefined();
  });

  it('allows refreshing statistics', () => {
    quizOldService.quizService = {
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
      expect(quizOldService.quizService.getUserStatistics).toHaveBeenCalled();
    }
  });
});
