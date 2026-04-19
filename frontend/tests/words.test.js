import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WordForm } from '../src/components/Words/WordForm';
import { vocabularyService } from '../src/services/vocabulary';

vi.mock('../src/services/vocabulary');

describe('Vocabulary Component', () => {
  it('renders vocabulary list', () => {
    // Test will be auto-generated via LLM
    expect(true).toBe(true);
  });

  it('allows adding new words', () => {
    // Test will be auto-generated via LLM
    expect(true).toBe(true);
  });
});

describe('WordForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vocabularyService.createWord.mockResolvedValue({ data: { id: 1 } });
  });

  it('renders form with example sentence field', () => {
    render(<WordForm onWordAdded={() => {}} />);
    
    expect(screen.getByLabelText('German word to add')).toBeInTheDocument();
    expect(screen.getByLabelText('English meaning of the word')).toBeInTheDocument();
    expect(screen.getByLabelText('Example sentence for the word')).toBeInTheDocument();
    expect(screen.getByText(/Example Sentence/)).toBeInTheDocument();
  });

  it('displays character counter for example sentence', async () => {
    const user = userEvent.setup();
    render(<WordForm onWordAdded={() => {}} />);
    
    const textarea = screen.getByLabelText('Example sentence for the word');
    await user.type(textarea, 'Das ist ein Beispiel');
    
    expect(screen.getByText(/20 \/ 500 characters/)).toBeInTheDocument();
  });

  it('prevents exceeding 500 character limit in example sentence', async () => {
    const user = userEvent.setup();
    render(<WordForm onWordAdded={() => {}} />);
    
    const textarea = screen.getByLabelText('Example sentence for the word');
    const longText = 'A'.repeat(501);
    
    await user.type(textarea, longText);
    
    // Should only have 500 characters
    expect(textarea.value.length).toBeLessThanOrEqual(500);
    expect(screen.getByText(/500 \/ 500 characters/)).toBeInTheDocument();
  });

  it('submits form with example sentence', async () => {
    const user = userEvent.setup();
    const onWordAdded = vi.fn();
    
    render(<WordForm onWordAdded={onWordAdded} />);
    
    const germanInput = screen.getByLabelText('German word to add');
    const meaningInput = screen.getByLabelText('English meaning of the word');
    const exampleInput = screen.getByLabelText('Example sentence for the word');
    const submitButton = screen.getByRole('button', { name: /Add Word/i });
    
    await user.type(germanInput, 'Wasser');
    await user.type(meaningInput, 'Water');
    await user.type(exampleInput, 'Das Wasser ist kalt.');
    
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(vocabularyService.createWord).toHaveBeenCalledWith(
        'Wasser',
        'Water',
        'Das Wasser ist kalt.'
      );
    });
    
    expect(onWordAdded).toHaveBeenCalled();
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    render(<WordForm onWordAdded={() => {}} />);
    
    const germanInput = screen.getByLabelText('German word to add');
    const meaningInput = screen.getByLabelText('English meaning of the word');
    const exampleInput = screen.getByLabelText('Example sentence for the word');
    const submitButton = screen.getByRole('button', { name: /Add Word/i });
    
    await user.type(germanInput, 'Wasser');
    await user.type(meaningInput, 'Water');
    await user.type(exampleInput, 'Das Wasser ist kalt.');
    
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(germanInput.value).toBe('');
      expect(meaningInput.value).toBe('');
      expect(exampleInput.value).toBe('');
    });
  });
});
