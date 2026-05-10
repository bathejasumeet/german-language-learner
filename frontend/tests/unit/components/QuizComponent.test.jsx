import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizComponent } from '../../../src/components/Quiz/QuizComponent';
import { vocabularyService } from '../../../src/services/vocabulary';
import { quizService } from '../../../src/services/quiz';

vi.mock('../../../src/services/vocabulary');
vi.mock('../../../src/services/quiz', () => ({
  quizService: {
    createQuiz: vi.fn(),
    submitQuiz: vi.fn(),
    getUserStatistics: vi.fn(),
  },
}));

const mockWords = [
  { id: 1, german_word: 'Apfel', meaning: 'Apple' },
  { id: 2, german_word: 'Wasser', meaning: 'Water' },
  { id: 3, german_word: 'Hund', meaning: 'Dog' },
  { id: 4, german_word: 'Katze', meaning: 'Cat' },
  { id: 5, german_word: 'Buch', meaning: 'Book' },
];

const mockQuestion = {
  question_id: 'q1',
  word_id: 1,
  german_word: 'Apfel',
  options: ['Apple', 'Book', 'Dog', 'Water'],
  correct_answer: 'Apple',
};

describe('QuizComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vocabularyService.getAllWords.mockResolvedValue({ data: mockWords });
  });

  it('renders "German Language Quiz" heading', async () => {
    render(<QuizComponent />);
    await waitFor(() => {
      expect(screen.getByText('German Language Quiz')).toBeDefined();
    });
  });

  it('shows question count selector', async () => {
    render(<QuizComponent />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Number of Questions/i)).toBeDefined();
    });
  });

  it('shows available word count', async () => {
    render(<QuizComponent />);
    await waitFor(() => {
      expect(screen.getByText(/Available words: 5/i)).toBeDefined();
    });
  });

  it('disables Start button when no words available', async () => {
    vocabularyService.getAllWords.mockResolvedValue({ data: [] });
    render(<QuizComponent />);
    await waitFor(() => {
      const startBtn = screen.getByRole('button', { name: /Start Quiz/i });
      expect(startBtn.disabled).toBe(true);
    });
  });

  it('enables Start button when words are available', async () => {
    render(<QuizComponent />);
    await waitFor(() => {
      const startBtn = screen.getByRole('button', { name: /Start Quiz/i });
      expect(startBtn.disabled).toBe(false);
    });
  });

  it('starts quiz and shows question on Start click', async () => {
    quizService.createQuiz.mockResolvedValue({ data: { id: 1 } });
    render(<QuizComponent />);
    await waitFor(() => screen.getByRole('button', { name: /Start Quiz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));
    await waitFor(() => {
      expect(screen.getByText('Apfel')).toBeDefined();
    });
  });

  it('shows results screen after answering all questions', async () => {
    quizService.createQuiz.mockResolvedValue({ data: { id: 1 } });
    quizService.submitQuiz.mockResolvedValue({ data: {} });
    render(<QuizComponent />);
    await waitFor(() => screen.getByRole('button', { name: /Start Quiz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));
    // Answer all 5 questions (minimum from select is 5; totalQuestions defaults to 10
    // but words.length = 5 so we answer 5 rounds until complete)
    await waitFor(() => screen.getByRole('group'));
    const optionButtons = screen.getAllByRole('button', { name: /Apple|Water|Dog|Cat|Book/i });
    // Click through questions — we just click any option 10 times
    for (let i = 0; i < 10; i++) {
      const options = screen.queryAllByRole('button', { name: /Apple|Water|Dog|Cat|Book/i });
      if (options.length === 0) break;
      fireEvent.click(options[0]);
      await new Promise((r) => setTimeout(r, 0));
    }
    await waitFor(() => {
      expect(screen.getByText(/Quiz complete/i)).toBeDefined();
    });
  });
});
