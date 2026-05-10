import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WordForm } from '../../../src/components/Words/WordForm';
import { vocabularyService } from '../../../src/services/vocabulary';

vi.mock('../../../src/services/vocabulary');

describe('WordForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vocabularyService.createWord.mockResolvedValue({ data: { id: 1 } });
  });

  it('renders German word, meaning, and example sentence fields', () => {
    render(<WordForm onWordAdded={() => {}} />);
    expect(screen.getByLabelText('German word to add')).toBeDefined();
    expect(screen.getByLabelText('English meaning of the word')).toBeDefined();
    expect(screen.getByLabelText('Example sentence for the word')).toBeDefined();
  });

  it('renders an Add Word submit button', () => {
    render(<WordForm onWordAdded={() => {}} />);
    expect(screen.getByRole('button', { name: /Add Word/i })).toBeDefined();
  });

  it('shows validation error when german word is empty on submit', async () => {
    const user = userEvent.setup();
    render(<WordForm onWordAdded={() => {}} />);
    await user.click(screen.getByRole('button', { name: /Add Word/i }));
    expect(screen.getByRole('alert').textContent).toContain('German word is required');
  });

  it('shows validation error when meaning is empty on submit', async () => {
    const user = userEvent.setup();
    render(<WordForm onWordAdded={() => {}} />);
    await user.type(screen.getByLabelText('German word to add'), 'Wasser');
    await user.click(screen.getByRole('button', { name: /Add Word/i }));
    expect(screen.getByRole('alert').textContent).toContain('Meaning is required');
  });

  it('submits form with valid German word and meaning', async () => {
    const user = userEvent.setup();
    const onWordAdded = vi.fn();
    render(<WordForm onWordAdded={onWordAdded} />);

    await user.type(screen.getByLabelText('German word to add'), 'Wasser');
    await user.type(screen.getByLabelText('English meaning of the word'), 'Water');
    await user.click(screen.getByRole('button', { name: /Add Word/i }));

    await waitFor(() => {
      expect(vocabularyService.createWord).toHaveBeenCalledWith('Wasser', 'Water', undefined);
      expect(onWordAdded).toHaveBeenCalledTimes(1);
    });
  });

  it('shows character counter for example sentence', async () => {
    const user = userEvent.setup();
    render(<WordForm onWordAdded={() => {}} />);
    await user.type(screen.getByLabelText('Example sentence for the word'), 'Hello');
    expect(screen.getByText(/5 \/ 500/)).toBeDefined();
  });

  it('does not exceed 500 characters in example sentence', async () => {
    const user = userEvent.setup();
    render(<WordForm onWordAdded={() => {}} />);
    const textarea = screen.getByLabelText('Example sentence for the word');
    await user.type(textarea, 'A'.repeat(501));
    expect(textarea.value.length).toBeLessThanOrEqual(500);
  });

  it('clears fields after successful submission', async () => {
    const user = userEvent.setup();
    render(<WordForm onWordAdded={() => {}} />);
    await user.type(screen.getByLabelText('German word to add'), 'Wasser');
    await user.type(screen.getByLabelText('English meaning of the word'), 'Water');
    await user.click(screen.getByRole('button', { name: /Add Word/i }));
    await waitFor(() => {
      expect(screen.getByLabelText('German word to add').value).toBe('');
      expect(screen.getByLabelText('English meaning of the word').value).toBe('');
    });
  });
});
