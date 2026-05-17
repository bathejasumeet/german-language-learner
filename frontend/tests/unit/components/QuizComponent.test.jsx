import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuizComponent } from '../../../src/components/Quiz/QuizComponent';
import { vocabularyService } from '../../../src/services/vocabulary';
import { quizService } from '../../../src/services/quizService';

vi.mock('../../../src/services/vocabulary');
vi.mock('../../../src/services/quizService', () => ({
  quizService: {
    generateQuiz: vi.fn(),
    completeQuiz: vi.fn(),
  },
}));

const makeWords = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    german_word: `Wort${i + 1}`,
    meaning: `Word${i + 1}`,
  }));

const mockWords10 = makeWords(10);

const mockQuestion = {
  id: 'q_1',
  vocabulary_id: 1,
  question: 'What is the English meaning of: Wort1?',
  german_word: 'Wort1',
  english_meaning: 'Word1',
  options: ['Word1', 'Word2', 'Word3', 'Word4'],
  correct_answer_index: 0,
};

describe('QuizComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vocabularyService.getAllWords.mockResolvedValue({ data: mockWords10 });
    quizService.completeQuiz.mockResolvedValue({ data: {} });
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
      expect(screen.getByText(/Available words: 10/i)).toBeDefined();
    });
  });

  it('shows error message when fewer than 10 words available', async () => {
    vocabularyService.getAllWords.mockResolvedValue({ data: makeWords(7) });
    render(<QuizComponent />);
    await waitFor(() => {
      expect(screen.getByText(/at least 10 words/i)).toBeDefined();
    });
    expect(screen.queryByRole('button', { name: /Start Quiz/i })).toBeNull();
  });

  it('shows Start Quiz button when 10 or more words available', async () => {
    render(<QuizComponent />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Quiz/i })).toBeDefined();
    });
  });

  it('starts quiz and shows question on Start click', async () => {
    quizService.generateQuiz.mockResolvedValue({
      data: { quiz_id: 'quiz_1', total_questions: 1, questions: [mockQuestion] },
    });
    render(<QuizComponent />);
    await waitFor(() => screen.getByRole('button', { name: /Start Quiz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));
    await waitFor(() => {
      expect(screen.getByText('Wort1')).toBeDefined();
    });
  });

  it('renders four options per question', async () => {
    quizService.generateQuiz.mockResolvedValue({
      data: { quiz_id: 'quiz_1', total_questions: 1, questions: [mockQuestion] },
    });
    render(<QuizComponent />);
    await waitFor(() => screen.getByRole('button', { name: /Start Quiz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));
    await waitFor(() => screen.getByText('Wort1'));
    const optionBtns = screen.getAllByRole('button', { name: /Option [ABCD]/i });
    expect(optionBtns.length).toBe(4);
  });

  it('shows results screen after answering all questions', async () => {
    quizService.generateQuiz.mockResolvedValue({
      data: { quiz_id: 'quiz_1', total_questions: 1, questions: [mockQuestion] },
    });
    render(<QuizComponent />);
    await waitFor(() => screen.getByRole('button', { name: /Start Quiz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));
    await waitFor(() => screen.getByText('Wort1'));
    // Select first option
    const optionBtns = screen.getAllByRole('button', { name: /Option A/i });
    fireEvent.click(optionBtns[0]);
    // Click the "See Results" next button
    await waitFor(() => screen.getByRole('button', { name: /See Results/i }));
    fireEvent.click(screen.getByRole('button', { name: /See Results/i }));
    await waitFor(() => {
      expect(screen.getByText(/Quiz Complete/i)).toBeDefined();
    });
  });

  it('shows Take Another Quiz button on results screen', async () => {
    quizService.generateQuiz.mockResolvedValue({
      data: { quiz_id: 'quiz_1', total_questions: 1, questions: [mockQuestion] },
    });
    render(<QuizComponent />);
    await waitFor(() => screen.getByRole('button', { name: /Start Quiz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));
    await waitFor(() => screen.getByText('Wort1'));
    fireEvent.click(screen.getAllByRole('button', { name: /Option A/i })[0]);
    await waitFor(() => screen.getByRole('button', { name: /See Results/i }));
    fireEvent.click(screen.getByRole('button', { name: /See Results/i }));
    await waitFor(() => screen.getByRole('button', { name: /Take Another Quiz/i }));
    expect(screen.getByRole('button', { name: /Take Another Quiz/i })).toBeDefined();
  });
});
