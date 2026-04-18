import { useState, useEffect } from 'react';
import { vocabularyService } from '../../services/vocabulary';
import { flashcardService } from '../../services/quiz';
import './FlashcardStudy.css';

export const FlashcardStudy = () => {
  const [words, setWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [studyMode, setStudyMode] = useState('select'); // select, study

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    setLoading(true);
    try {
      const response = await vocabularyService.getAllWords(0, 1000);
      setWords(response.data);
    } catch (err) {
      setError('Failed to load words');
    } finally {
      setLoading(false);
    }
  };

  const handleWordSelection = (wordId) => {
    if (selectedWords.includes(wordId)) {
      setSelectedWords(selectedWords.filter((id) => id !== wordId));
    } else {
      setSelectedWords([...selectedWords, wordId]);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (selectedWords.length === 0) {
      setError('Select at least one word');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await flashcardService.generateFlashcards(selectedWords);
      setFlashcards(response.data);
      setCurrentIndex(0);
      setIsFlipped(false);
      setStudyMode('study');
    } catch (err) {
      setError('Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkKnown = async () => {
    const flashcard = flashcards[currentIndex];
    try {
      await flashcardService.markFlashcardKnown(flashcard.id);
      handleNextCard();
    } catch (err) {
      setError('Failed to mark flashcard');
    }
  };

  const handleNextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setStudyMode('complete');
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  if (loading && studyMode === 'select') {
    return <div className="loading" role="status" aria-live="polite">Loading words...</div>;
  }

  if (studyMode === 'select') {
    return (
      <div className="flashcard-select">
        <h2>Select Words for Flashcards</h2>
        {error && <div className="error" role="alert" aria-live="assertive">{error}</div>}
        
        <div className="words-grid" role="group" aria-label="Select words for flashcard study">
          {words.map((word) => (
            <div
              key={word.id}
              className={`word-card ${selectedWords.includes(word.id) ? 'selected' : ''}`}
              onClick={() => handleWordSelection(word.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleWordSelection(word.id);
                }
              }}
              role="checkbox"
              aria-checked={selectedWords.includes(word.id)}
              aria-label={`${word.german_word} - ${word.meaning}`}
              tabIndex="0"
            >
              <div className="german">{word.german_word}</div>
              <div className="meaning">{word.meaning}</div>
            </div>
          ))}
        </div>

        <div className="actions">
          <p aria-live="polite">Selected: {selectedWords.length} words</p>
          <button
            onClick={handleGenerateFlashcards}
            disabled={selectedWords.length === 0 || loading}
            aria-label={`Generate flashcards from ${selectedWords.length} selected words`}
            aria-busy={loading}
          >
            {loading ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </div>
      </div>
    );
  }

  if (studyMode === 'study') {
    const flashcard = flashcards[currentIndex];
    const word = flashcard.word;

    return (
      <div className="flashcard-study">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
            }}
          ></div>
        </div>

        <p className="progress-text">
          Card {currentIndex + 1} of {flashcards.length}
        </p>

        <div
          className={`flashcard ${isFlipped ? 'flipped' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="flashcard-front">
            <div className="label">German</div>
            <div className="content">{word.german_word}</div>
          </div>
          <div className="flashcard-back">
            <div className="label">English</div>
            <div className="content">{word.meaning}</div>
          </div>
        </div>

        <p className="click-hint">Click card to flip</p>

        <div className="buttons">
          <button onClick={handlePrevCard} disabled={currentIndex === 0}>
            ← Previous
          </button>
          <button
            onClick={handleMarkKnown}
            className="known-btn"
          >
            I Know This
          </button>
          <button onClick={handleNextCard} disabled={currentIndex === flashcards.length - 1}>
            Next →
          </button>
        </div>
      </div>
    );
  }

  if (studyMode === 'complete') {
    return (
      <div className="flashcard-complete">
        <h2>Session Complete! 🎉</h2>
        <p>You studied {flashcards.length} flashcards.</p>
        <button onClick={() => setStudyMode('select')}>Study More Words</button>
      </div>
    );
  }
};
