import { useState } from 'react';
import { VocabularyManager } from '../components/VocabularyManager';

export const WordsTab = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleWordUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="words-tab">
      <VocabularyManager
        key={refreshKey}
        onEditWord={handleWordUpdated}
      />
    </div>
  );
};
