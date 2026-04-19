import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VocabularyManager } from '../../src/components/VocabularyManager';
import { vocabularyService } from '../../src/services/vocabulary';

vi.mock('../../src/services/vocabulary');

describe('VocabularyManager Component', () => {
  const mockWords = [
    {
      id: 1,
      german_word: 'Wasser',
      meaning: 'Water',
      example_sentence: 'Das Wasser ist kalt.'
    },
    {
      id: 2,
      german_word: 'Hund',
      meaning: 'Dog',
      example_sentence: 'Der Hund ist freundlich.'
    },
    {
      id: 3,
      german_word: 'Katze',
      meaning: 'Cat',
      example_sentence: null
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vocabularyService.getAllWords.mockResolvedValue({ data: mockWords });
    vocabularyService.updateWord.mockResolvedValue({ data: mockWords[0] });
    vocabularyService.deleteWord.mockResolvedValue({ data: {} });
  });

  it('renders vocabulary manager title', async () => {
    render(<VocabularyManager onEditWord={() => {}} onNavigateToVocab={() => {}} />);
    
    expect(screen.getByText('Manage Vocabulary')).toBeInTheDocument();
  });

  it('displays vocabulary list with all words', async () => {
    render(<VocabularyManager onEditWord={() => {}} onNavigateToVocab={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Wasser')).toBeInTheDocument();
      expect(screen.getByText('Water')).toBeInTheDocument();
      expect(screen.getByText('Hund')).toBeInTheDocument();
      expect(screen.getByText('Dog')).toBeInTheDocument();
      expect(screen.getByText('Katze')).toBeInTheDocument();
      expect(screen.getByText('Cat')).toBeInTheDocument();
    });
  });

  it('displays example sentences when present', async () => {
    render(<VocabularyManager onEditWord={() => {}} onNavigateToVocab={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Das Wasser ist kalt.')).toBeInTheDocument();
      expect(screen.getByText('Der Hund ist freundlich.')).toBeInTheDocument();
    });
  });

  it('provides search functionality', async () => {
    const user = userEvent.setup();
    render(<VocabularyManager onEditWord={() => {}} onNavigateToVocab={() => {}} />);
    
    const searchInput = screen.getByPlaceholderText(/Search by German word or meaning/);
    
    await user.type(searchInput, 'Wasser');
    
    await waitFor(() => {
      expect(screen.getByText('Wasser')).toBeInTheDocument();
      expect(screen.queryByText('Hund')).not.toBeInTheDocument();
    });
  });

  it('filters by English meaning', async () => {
    const user = userEvent.setup();
    render(<VocabularyManager onEditWord={() => {}} onNavigateToVocab={() => {}} />);
    
    const searchInput = screen.getByPlaceholderText(/Search by German word or meaning/);
    
    await user.type(searchInput, 'Dog');
    
    await waitFor(() => {
      expect(screen.getByText('Hund')).toBeInTheDocument();
      expect(screen.queryByText('Wasser')).not.toBeInTheDocument();
    });
  });

  it('displays Edit and Delete buttons for each word', async () => {
    render(<VocabularyManager onEditWord={() => {}} onNavigateToVocab={() => {}} />);
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');
      
      expect(editButtons.length).toBeGreaterThanOrEqual(3);
      expect(deleteButtons.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('allows editing a word', async () => {
    const user = userEvent.setup();
    render(<VocabularyManager onEditWord={() => {}} onNavigateToVocab={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Wasser')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    // Should show edit form with current values
    const inputs = screen.getAllByDisplayValue('Wasser');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('shows Create New Word button', async () => {
    const onNavigateToVocab = vi.fn();
    render(<VocabularyManager onEditWord={() => {}} onNavigateToVocab={onNavigateToVocab} />);
    
    const createButton = screen.getByText('+ Create New Word');
    expect(createButton).toBeInTheDocument();
  });

  it('calls onNavigateToVocab when Create New Word is clicked', async () => {
    const user = userEvent.setup();
    const onNavigateToVocab = vi.fn();
    
    render(<VocabularyManager onEditWord={() => {}} onNavigateToVocab={onNavigateToVocab} />);
    
    const createButton = screen.getByText('+ Create New Word');
    await user.click(createButton);
    
    expect(onNavigateToVocab).toHaveBeenCalled();
  });

  it('shows loading state while fetching words', () => {
    vocabularyService.getAllWords.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: mockWords }), 100))
    );
    
    const { rerender } = render(<VocabularyManager onEditWord={() => {}} onNavigateToVocab={() => {}} />);
    
    expect(screen.getByText('Loading vocabulary...')).toBeInTheDocument();
  });

  it('handles pagination', async () => {
    const manyWords = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      german_word: `Word${i + 1}`,
      meaning: `Meaning${i + 1}`,
      example_sentence: null
    }));
    
    vocabularyService.getAllWords.mockResolvedValue({ data: manyWords });
    
    render(<VocabularyManager onEditWord={() => {}} onNavigateToVocab={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
    });
  });

  it('shows empty state message when no words match search', async () => {
    const user = userEvent.setup();
    render(<VocabularyManager onEditWord={() => {}} onNavigateToVocab={() => {}} />);
    
    const searchInput = screen.getByPlaceholderText(/Search by German word or meaning/);
    await user.type(searchInput, 'nonexistent');
    
    await waitFor(() => {
      expect(screen.getByText("No words match your search")).toBeInTheDocument();
    });
  });
});
