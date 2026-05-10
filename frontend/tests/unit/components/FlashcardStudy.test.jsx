import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FlashcardStudy } from '../../../src/components/Flashcards/FlashcardStudy';
import { vocabularyService } from '../../../src/services/vocabulary';
import { flashcardService } from '../../../src/services/quiz';

vi.mock('../../../src/services/vocabulary');
vi.mock('../../../src/services/quiz', () => ({
  flashcardService: {
    generateFlashcards: vi.fn(),
    markFlashcardKnown: vi.fn(),
  },
}));

const mockWords = [
  { id: 1, german_word: 'Apfel', meaning: 'Apple' },
  { id: 2, german_word: 'Wasser', meaning: 'Water' },
];

const mockFlashcards = [
  { id: 10, word: { german_word: 'Apfel', meaning: 'Apple', example_sentence: null } },
  { id: 11, word: { german_word: 'Wasser', meaning: 'Water', example_sentence: 'Das Wasser.' } },
];

describe('FlashcardStudy Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vocabularyService.getAllWords.mockResolvedValue({ data: mockWords });
    flashcardService.generateFlashcards.mockResolvedValue({ data: mockFlashcards });
  });

  it('shows loading state initially', () => {
    vocabularyService.getAllWords.mockReturnValue(new Promise(() => {}));
    render(<FlashcardStudy />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('auto-loads all words on mount without selection step', async () => {
    render(<FlashcardStudy />);
    await waitFor(() => {
      expect(vocabularyService.getAllWords).toHaveBeenCalledTimes(1);
      expect(flashcardService.generateFlashcards).toHaveBeenCalledWith([1, 2]);
    });
  });

  it('does not render word selection UI', async () => {
    render(<FlashcardStudy />);
    await waitFor(() => screen.getByText('Apfel'));
    expect(screen.queryByText(/Select words/i)).toBeNull();
    expect(screen.queryByText(/Generate Flashcards/i)).toBeNull();
  });

  it('displays the first flashcard front face', async () => {
    render(<FlashcardStudy />);
    await waitFor(() => {
      expect(screen.getByText('Apfel')).toBeDefined();
    });
  });

  it('shows progress counter', async () => {
    render(<FlashcardStudy />);
    await waitFor(() => {
      expect(screen.getByText(/1 \/ 2/)).toBeDefined();
    });
  });

  it('navigates to next card on Next button click', async () => {
    render(<FlashcardStudy />);
    await waitFor(() => screen.getByText('Apfel'));
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    await waitFor(() => {
      expect(screen.getByText(/2 \/ 2/)).toBeDefined();
    });
  });

  it('shows empty state when no words available', async () => {
    vocabularyService.getAllWords.mockResolvedValue({ data: [] });
    render(<FlashcardStudy />);
    await waitFor(() => {
      expect(screen.getByText(/No words available/i)).toBeDefined();
    });
  });

  it('shows complete screen after last card', async () => {
    render(<FlashcardStudy />);
    await waitFor(() => screen.getByText('Apfel'));
    // Go to last card via Next
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    await waitFor(() => screen.getByText('Wasser'));
    // Trigger completion via Know it on the last card
    fireEvent.click(screen.getByRole('button', { name: /Know it/i }));
    await waitFor(() => {
      expect(screen.getByText(/Session complete/i)).toBeDefined();
    });
  });
});
