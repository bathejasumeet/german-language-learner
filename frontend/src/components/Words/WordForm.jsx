import { useState } from 'react';
import { vocabularyService } from '../../services/vocabulary';
import { colors } from '../../services/colors';
import './WordForm.css';

export const WordForm = ({ onWordAdded }) => {
  const [germanWord, setGermanWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const MAX_EXAMPLE_LENGTH = 500;

  const handleExampleChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_EXAMPLE_LENGTH) {
      setExampleSentence(value);
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await vocabularyService.createWord(germanWord, meaning, exampleSentence || undefined);
      setGermanWord('');
      setMeaning('');
      setExampleSentence('');
      setCharCount(0);
      onWordAdded && onWordAdded();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add word');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderColor: error ? colors.ERROR : colors.BORDER,
    backgroundColor: colors.BACKGROUND,
    color: colors.TEXT,
    padding: '0.5rem',
    borderRadius: '0.375rem',
    fontSize: '1rem'
  };

  const labelStyle = {
    color: colors.TEXT,
    fontWeight: '600',
    marginBottom: '0.25rem'
  };

  const buttonStyle = {
    backgroundColor: colors.PRIMARY,
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    fontSize: '1rem'
  };

  return (
    <form onSubmit={handleSubmit} className="word-form">
      <h2 style={{ color: colors.TEXT }}>Add New Word</h2>
      {error && <div className="error" style={{ color: colors.ERROR, backgroundColor: colors.BACKGROUND, padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem' }} role="alert" aria-live="assertive">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="german" style={labelStyle}>German Word:</label>
        <input
          id="german"
          type="text"
          value={germanWord}
          onChange={(e) => setGermanWord(e.target.value)}
          required
          disabled={loading}
          aria-label="German word to add"
          aria-required="true"
          aria-invalid={error ? 'true' : 'false'}
          style={inputStyle}
        />
      </div>

      <div className="form-group">
        <label htmlFor="meaning" style={labelStyle}>Meaning:</label>
        <input
          id="meaning"
          type="text"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          required
          disabled={loading}
          aria-label="English meaning of the word"
          aria-required="true"
          aria-invalid={error ? 'true' : 'false'}
          style={inputStyle}
        />
      </div>

      <div className="form-group">
        <label htmlFor="example" style={labelStyle}>Example Sentence (Optional):</label>
        <textarea
          id="example"
          value={exampleSentence}
          onChange={handleExampleChange}
          disabled={loading}
          aria-label="Example sentence for the word"
          style={{
            ...inputStyle,
            minHeight: '80px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          placeholder="Provide an example sentence to help with learning..."
        />
        <div style={{ fontSize: '0.875rem', color: colors.NEUTRAL, marginTop: '0.25rem' }}>
          {charCount} / {MAX_EXAMPLE_LENGTH} characters
        </div>
      </div>

      <button type="submit" disabled={loading} aria-busy={loading} style={buttonStyle}>
        {loading ? 'Adding...' : 'Add Word'}
      </button>
    </form>
  );
};
