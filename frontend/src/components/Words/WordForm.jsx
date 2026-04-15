import { useState } from 'react';
import { vocabularyService } from '../services/vocabulary';
import './WordForm.css';

export const WordForm = ({ onWordAdded }) => {
  const [germanWord, setGermanWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await vocabularyService.createWord(germanWord, meaning);
      setGermanWord('');
      setMeaning('');
      onWordAdded && onWordAdded();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add word');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="word-form">
      <h2>Add New Word</h2>
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="german">German Word:</label>
        <input
          id="german"
          type="text"
          value={germanWord}
          onChange={(e) => setGermanWord(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="meaning">Meaning:</label>
        <input
          id="meaning"
          type="text"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Word'}
      </button>
    </form>
  );
};
