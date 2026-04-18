import { useState } from 'react';
import { Vocabulary } from '../pages/Vocabulary';
import { QuizComponent } from '../components/Quiz/QuizComponent';
import { Statistics } from '../components/Quiz/Statistics';
import { FlashcardStudy } from '../components/Flashcards/FlashcardStudy';
import './Navigation.css';

export const Navigation = () => {
  const [currentPage, setCurrentPage] = useState('vocabulary');

  const renderPage = () => {
    switch (currentPage) {
      case 'vocabulary':
        return <Vocabulary />;
      case 'flashcards':
        return <FlashcardStudy />;
      case 'quiz':
        return <QuizComponent />;
      case 'statistics':
        return <Statistics />;
      default:
        return <Vocabulary />;
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-brand">
          <h1>German Language Learner</h1>
        </div>
        <ul className="navbar-nav" role="menubar">
          <li role="none">
            <button
              className={`nav-link ${currentPage === 'vocabulary' ? 'active' : ''}`}
              onClick={() => setCurrentPage('vocabulary')}
              aria-current={currentPage === 'vocabulary' ? 'page' : undefined}
              aria-label="Navigate to Vocabulary section"
              role="menuitem"
            >
              📚 Vocabulary
            </button>
          </li>
          <li role="none">
            <button
              className={`nav-link ${currentPage === 'flashcards' ? 'active' : ''}`}
              onClick={() => setCurrentPage('flashcards')}
              aria-current={currentPage === 'flashcards' ? 'page' : undefined}
              aria-label="Navigate to Flashcards section"
              role="menuitem"
            >
              🃏 Flashcards
            </button>
          </li>
          <li role="none">
            <button
              className={`nav-link ${currentPage === 'quiz' ? 'active' : ''}`}
              onClick={() => setCurrentPage('quiz')}
              aria-current={currentPage === 'quiz' ? 'page' : undefined}
              aria-label="Navigate to Quiz section"
              role="menuitem"
            >
              ✅ Quiz
            </button>
          </li>
          <li role="none">
            <button
              className={`nav-link ${currentPage === 'statistics' ? 'active' : ''}`}
              onClick={() => setCurrentPage('statistics')}
              aria-current={currentPage === 'statistics' ? 'page' : undefined}
              aria-label="Navigate to Statistics section"
              role="menuitem"
            >
              📊 Statistics
            </button>
          </li>
        </ul>
      </nav>

      <main className="main-content" role="main">
        {renderPage()}
      </main>
    </div>
  );
};
