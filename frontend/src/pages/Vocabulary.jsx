import { useState } from 'react';
import { WordForm } from '../components/Words/WordForm';
import { WordList } from '../components/Words/WordList';
import './Vocabulary.css';

export const Vocabulary = () => {
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
          </div>
          <div className="list-section">
            <WordList refresh={refresh} />
          </div>
        </div>
      </div>
    </div>
  );
};
