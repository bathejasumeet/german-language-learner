import { useState } from 'react';
import { VocabularyManager } from '../components/VocabularyManager';

export const WordsTab = ({ onNavigateToVocab }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleWordUpdated = () => {
    // Trigger refresh by changing the key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="words-tab" style={{ padding: '1rem' }}>
      <VocabularyManager
        key={refreshKey}
        onEditWord={handleWordUpdated}
        onNavigateToVocab={onNavigateToVocab}
      />
    </div>
  );
};
