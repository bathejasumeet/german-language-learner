import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Statistics } from '../../../src/components/Quiz/Statistics';
import { quizService } from '../../../src/services/quiz';

vi.mock('../../../src/services/quiz', () => ({
  quizService: {
    getUserStatistics: vi.fn(),
  },
}));

const mockStats = {
  total_words: 20,
  total_quizzes: 5,
  average_quiz_score: 78,
  total_reviews: 42,
  overall_accuracy: 85,
};

describe('Statistics Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while fetching', () => {
    quizService.getUserStatistics.mockReturnValue(new Promise(() => {}));
    render(<Statistics />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('shows empty state message when no stats (no quizzes taken)', async () => {
    quizService.getUserStatistics.mockResolvedValue({
      data: { total_words: 0, total_quizzes: 0, average_quiz_score: 0, total_reviews: 0, overall_accuracy: 0 },
    });
    render(<Statistics />);
    await waitFor(() => {
      expect(screen.getByText(/No statistics available yet/i)).toBeDefined();
    });
  });

  it('renders stat cards when stats are available', async () => {
    quizService.getUserStatistics.mockResolvedValue({ data: mockStats });
    render(<Statistics />);
    await waitFor(() => {
      expect(screen.getByText('20')).toBeDefined();
      expect(screen.getByText('5')).toBeDefined();
      expect(screen.getByText('78%')).toBeDefined();
      expect(screen.getByText('42')).toBeDefined();
      expect(screen.getByText('85%')).toBeDefined();
    });
  });

  it('shows Refresh button', async () => {
    quizService.getUserStatistics.mockResolvedValue({ data: mockStats });
    render(<Statistics />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Refresh/i })).toBeDefined();
    });
  });

  it('refreshes stats on Refresh button click', async () => {
    quizService.getUserStatistics.mockResolvedValue({ data: mockStats });
    render(<Statistics />);
    await waitFor(() => screen.getByRole('button', { name: /Refresh/i }));
    fireEvent.click(screen.getByRole('button', { name: /Refresh/i }));
    await waitFor(() => {
      expect(quizService.getUserStatistics).toHaveBeenCalledTimes(2);
    });
  });

  it('shows error message on failed fetch', async () => {
    quizService.getUserStatistics.mockRejectedValue(new Error('Network error'));
    render(<Statistics />);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
    });
  });
});
