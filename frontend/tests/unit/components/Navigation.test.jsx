import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from '../../../src/components/Navigation';

// Mock all page/component imports to avoid deep render
vi.mock('../../../src/pages/Vocabulary', () => ({
  Vocabulary: () => <div>Vocabulary Page</div>,
}));
vi.mock('../../../src/pages/WordsTab', () => ({
  WordsTab: () => <div>Words Page</div>,
}));
vi.mock('../../../src/components/Flashcards/FlashcardStudy', () => ({
  FlashcardStudy: () => <div>Flashcards Page</div>,
}));
vi.mock('../../../src/components/Quiz/QuizComponent', () => ({
  QuizComponent: () => <div>Quiz Page</div>,
}));
vi.mock('../../../src/components/Quiz/Statistics', () => ({
  Statistics: () => <div>Statistics Page</div>,
}));

describe('Navigation Component', () => {
  it('renders all five tab buttons', () => {
    render(<Navigation />);
    expect(screen.getByRole('button', { name: 'Vocabulary' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Words' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Flashcards' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Quiz' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Statistics' })).toBeDefined();
  });

  it('defaults to Vocabulary tab', () => {
    render(<Navigation />);
    expect(screen.getByText('Vocabulary Page')).toBeDefined();
    const activeBtn = screen.getByRole('button', { name: 'Vocabulary' });
    expect(activeBtn.className).toContain('active');
  });

  it('switches to Words tab on click', () => {
    render(<Navigation />);
    fireEvent.click(screen.getByRole('button', { name: 'Words' }));
    expect(screen.getByText('Words Page')).toBeDefined();
  });

  it('switches to Flashcards tab on click', () => {
    render(<Navigation />);
    fireEvent.click(screen.getByRole('button', { name: 'Flashcards' }));
    expect(screen.getByText('Flashcards Page')).toBeDefined();
  });

  it('switches to Quiz tab on click', () => {
    render(<Navigation />);
    fireEvent.click(screen.getByRole('button', { name: 'Quiz' }));
    expect(screen.getByText('Quiz Page')).toBeDefined();
  });

  it('switches to Statistics tab on click', () => {
    render(<Navigation />);
    fireEvent.click(screen.getByRole('button', { name: 'Statistics' }));
    expect(screen.getByText('Statistics Page')).toBeDefined();
  });

  it('does not contain emoji in tab labels', () => {
    render(<Navigation />);
    const nav = screen.getByRole('navigation');
    expect(nav.textContent).not.toMatch(/[\u{1F4DA}\u{1F4D6}\u{1F0CF}\u2705\u{1F4CA}]/u);
  });
});
