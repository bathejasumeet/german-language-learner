import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WordList } from '../../../src/components/Words/WordList';
import { vocabularyService } from '../../../src/services/vocabulary';

vi.mock('../../../src/services/vocabulary');

const mockWords = [
  { id: 1, german_word: 'Wasser', meaning: 'Water', times_practiced: 3, accuracy: 80 },
  { id: 2, german_word: 'Hund', meaning: 'Dog', times_practiced: 1, accuracy: 100 },
];

describe('WordList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vocabularyService.getAllWords.mockResolvedValue({ data: mockWords });
  });

  it('renders the word list table after loading', async () => {
    render(<WordList />);
    await waitFor(() => {
      expect(screen.getByText('Wasser')).toBeDefined();
      expect(screen.getByText('Water')).toBeDefined();
    });
  });

  it('shows loading message initially', () => {
    vocabularyService.getAllWords.mockReturnValue(new Promise(() => {}));
    render(<WordList />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('shows empty state when no words exist', async () => {
    vocabularyService.getAllWords.mockResolvedValue({ data: [] });
    render(<WordList />);
    await waitFor(() => {
      expect(screen.getByText(/No words added yet/i)).toBeDefined();
    });
  });

  it('shows error message on fetch failure', async () => {
    vocabularyService.getAllWords.mockRejectedValue(new Error('Network error'));
    render(<WordList />);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
    });
  });

  it('calls deleteWord on delete button click', async () => {
    vocabularyService.deleteWord.mockResolvedValue({});
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<WordList />);
    await waitFor(() => screen.getByText('Wasser'));
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(vocabularyService.deleteWord).toHaveBeenCalledWith(1);
    });
    confirmSpy.mockRestore();
  });
});
