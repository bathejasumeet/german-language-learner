import { useState, useEffect } from 'react';
import { vocabularyService } from '../services/vocabulary';
import './WordList.css';

export const WordList = ({ refresh }) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWords();
  }, [refresh]);

  const fetchWords = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await vocabularyService.getAllWords();
      setWords(response.data);
    } catch (err) {
      setError('Failed to load words');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (wordId) => {
    if (!confirm('Are you sure you want to delete this word?')) return;

    try {
      await vocabularyService.deleteWord(wordId);
      setWords(words.filter((w) => w.id !== wordId));
    } catch (err) {
      setError('Failed to delete word');
    }
  };

  if (loading) return <div className="loading">Loading words...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="word-list">
      <h2>Vocabulary List ({words.length})</h2>
      {words.length === 0 ? (
        <p className="no-words">No words added yet. Add your first word!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>German Word</th>
              <th>Meaning</th>
              <th>Times Practiced</th>
              <th>Accuracy</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {words.map((word) => (
              <tr key={word.id}>
                <td>{word.german_word}</td>
                <td>{word.meaning}</td>
                <td>{word.times_practiced}</td>
                <td>{word.accuracy.toFixed(1)}%</td>
                <td>
                  <button
                    onClick={() => handleDelete(word.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
