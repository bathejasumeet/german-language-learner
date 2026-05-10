import { useState, useEffect } from 'react';
import { vocabularyService } from '../../services/vocabulary';
import { flashcardService } from '../../services/quiz';
import './FlashcardStudy.css';

export const FlashcardStudy = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studyMode, setStudyMode] = useState('study');

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    setLoading(true);
    setError('');
    try {
      const wordsResponse = await vocabularyService.getAllWords(0, 1000);
      const wordIds = wordsResponse.data.map((w) => w.id);
      if (wordIds.length === 0) {
        setFlashcards([]);
        setLoading(false);
        return;
      }
      const response = await flashcardService.generateFlashcards(wordIds);
      setFlashcards(response.data);
      setCurrentIndex(0);
      setIsFlipped(false);
      setStudyMode('study');
    } catch (err) {
      setError('Failed to load flashcards. Make sure you have words added.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkKnown = async () => {
    const flashcard = flashcards[currentIndex];
    try {
      await flashcardService.markFlashcardKnown(flashcard.id);
    } catch (err) {
      // silently skip if marking fails
    }
    handleNextCard();
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

  if (loading) {
    return <div className="flashcard-status" role="status" aria-live="polite">Loading flashcards...</div>;
  }

  if (error) {
    return <div className="flashcard-status flashcard-error" role="alert">{error}</div>;
  }

  if (flashcards.length === 0) {
    return (
      <div className="flashcard-status">
        No words available. Add words in the Vocabulary tab first.
      </div>
    );
  }

  if (studyMode === 'complete') {
    return (
      <div className="flashcard-complete">
        <h2>Session complete</h2>
        <p>You studied {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}.</p>
        <button className="btn-primary" onClick={loadFlashcards}>Study Again</button>
      </div>
    );
  }

  const flashcard = flashcards[currentIndex];
  const word = flashcard.word;

  return (
    <div className="flashcard-study">
      <div className="flashcard-progress">
        <div
          className="flashcard-progress-fill"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>
      <p className="flashcard-counter">{currentIndex + 1} / {flashcards.length}</p>

      <button
        className={`flashcard-card${isFlipped ? ' flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
        aria-label={isFlipped ? `Back: ${word.meaning}` : `Front: ${word.german_word}. Click to reveal meaning.`}
      >
        <div className="flashcard-face flashcard-front">
          <span className="flashcard-label">German</span>
          <span className="flashcard-word">{word.german_word}</span>
          <span className="flashcard-hint">tap to flip</span>
        </div>
        <div className="flashcard-face flashcard-back">
          <span className="flashcard-label">English</span>
          <span className="flashcard-word">{word.meaning}</span>
          {word.example_sentence && (
            <span className="flashcard-example">{word.example_sentence}</span>
          )}
        </div>
      </button>

      <div className="flashcard-actions">
        <button onClick={handlePrevCard} disabled={currentIndex === 0} className="btn-secondary">
          Previous
        </button>
        <button onClick={handleMarkKnown} className="btn-known">
          Know it
        </button>
        <button onClick={handleNextCard} disabled={currentIndex === flashcards.length - 1} className="btn-secondary">
          Next
        </button>
      </div>
    </div>
  );
};
