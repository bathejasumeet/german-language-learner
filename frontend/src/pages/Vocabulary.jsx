import { useState } from 'react';
import { WordForm } from '../components/Words/WordForm';
import './Vocabulary.css';

export const Vocabulary = () => {
  const [refresh, setRefresh] = useState(false);

  const handleWordAdded = () => {
    setRefresh((r) => !r);
  };

  return (
    <div className="vocabulary-page">
      <h2>Add Vocabulary</h2>
      <WordForm onWordAdded={handleWordAdded} />
    </div>
  );
};
