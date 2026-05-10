import { useState } from 'react';
import { vocabularyService } from '../../services/vocabulary';
import './WordForm.css';

export const WordForm = ({ onWordAdded }) => {
  const [germanWord, setGermanWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const MAX_EXAMPLE_LENGTH = 500;

  const handleExampleChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_EXAMPLE_LENGTH) {
      setExampleSentence(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!germanWord.trim()) {
      setError('German word is required.');
      return;
    }
    if (!meaning.trim()) {
      setError('Meaning is required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await vocabularyService.createWord(germanWord.trim(), meaning.trim(), exampleSentence.trim() || undefined);
      setGermanWord('');
      setMeaning('');
      setExampleSentence('');
      onWordAdded && onWordAdded();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add word');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="word-form">
      {error && (
        <div className="form-error" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="german">German Word</label>
        <input
          id="german"
          type="text"
          value={germanWord}
          onChange={(e) => setGermanWord(e.target.value)}
          disabled={loading}
          aria-label="German word to add"
          aria-required="true"
          placeholder="e.g. das Buch"
        />
      </div>

      <div className="form-group">
        <label htmlFor="meaning">Meaning</label>
        <input
          id="meaning"
          type="text"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          disabled={loading}
          aria-label="English meaning of the word"
          aria-required="true"
          placeholder="e.g. the book"
        />
      </div>

      <div className="form-group">
        <label htmlFor="example">Example Sentence <span className="optional">(optional)</span></label>
        <textarea
          id="example"
          value={exampleSentence}
          onChange={handleExampleChange}
          disabled={loading}
          aria-label="Example sentence for the word"
          placeholder="Provide an example sentence..."
          rows={3}
        />
        <span className="char-count">{exampleSentence.length} / {MAX_EXAMPLE_LENGTH}</span>
      </div>

      <button type="submit" disabled={loading} aria-busy={loading} className="btn-primary">
        {loading ? 'Adding...' : 'Add Word'}
      </button>
    </form>
  );
};
