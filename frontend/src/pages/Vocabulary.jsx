import { useState } from 'react';
import { WordForm } from '../components/Words/WordForm';
import './Vocabulary.css';

export const Vocabulary = ({ onNavigateToWords }) => {
  const [refresh, setRefresh] = useState(false);

  const handleWordAdded = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="vocabulary-page">
      <div className="container">
        <h1>German Vocabulary Manager</h1>
        <div className="content">
          <div className="form-section">
            <WordForm onWordAdded={handleWordAdded} />
            
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f4ff', borderRadius: '0.5rem' }}>
              <p style={{ margin: '0.5rem 0' }}>
                📖 Once you've created your vocabulary, go to the <strong>Words</strong> tab to manage, edit, and browse your collection.
              </p>
              <button
                onClick={onNavigateToWords}
                style={{
                  marginTop: '1rem',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                View All Words →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
