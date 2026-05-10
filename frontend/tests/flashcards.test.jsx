import { describe, it, expect, beforeEach, vi, waitFor } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashcardStudy } from '../src/components/Flashcards/FlashcardStudy';
import { vocabularyService } from '../src/services/vocabulary';
import { flashcardService } from '../src/services/quiz';

vi.mock('../src/services/vocabulary');
vi.mock('../src/services/quiz', () => ({
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
  { id: 11, word: { german_word: 'Wasser', meaning: 'Water', example_sentence: null } },
];

describe('FlashcardStudy Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vocabularyService.getAllWords.mockResolvedValue({ data: mockWords });
    flashcardService.generateFlashcards.mockResolvedValue({ data: mockFlashcards });
  });

  it('auto-loads words on mount without a word selection step', async () => {
    render(<FlashcardStudy />);
    await screen.findByText('Apfel');
    expect(vocabularyService.getAllWords).toHaveBeenCalledTimes(1);
    expect(flashcardService.generateFlashcards).toHaveBeenCalledWith([1, 2]);
    expect(screen.queryByText(/Select words/i)).toBeNull();
  });

  it('displays flashcard with German word on front', async () => {
    render(<FlashcardStudy />);
    await screen.findByText('Apfel');
    expect(screen.getByText('Apfel')).toBeDefined();
  });

  it('shows loading indicator while fetching', () => {
    vocabularyService.getAllWords.mockReturnValue(new Promise(() => {}));
    render(<FlashcardStudy />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('tracks progress through flashcard deck', async () => {
    render(<FlashcardStudy />);
    await screen.findByText('Apfel');
    expect(screen.getByText(/1 \/ 2/)).toBeDefined();
  });

  it('shows empty state when no words available', async () => {
    vocabularyService.getAllWords.mockResolvedValue({ data: [] });
    render(<FlashcardStudy />);
    await screen.findByText(/No words available/i);
  });

  it('shows completion message when all cards studied', async () => {
    render(<FlashcardStudy />);
    await screen.findByText('Apfel');
    // Move to last card
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    await screen.findByText('Wasser');
    // Trigger completion from last card via Know it
    fireEvent.click(screen.getByRole('button', { name: /Know it/i }));
    await screen.findByText(/Session complete/i);
  });
});
