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
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>German Language Learner</h1>
        </div>
        <ul className="navbar-nav">
          <li>
            <button
              className={`nav-link ${currentPage === 'vocabulary' ? 'active' : ''}`}
              onClick={() => setCurrentPage('vocabulary')}
            >
              📚 Vocabulary
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'flashcards' ? 'active' : ''}`}
              onClick={() => setCurrentPage('flashcards')}
            >
              🃏 Flashcards
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'quiz' ? 'active' : ''}`}
              onClick={() => setCurrentPage('quiz')}
            >
              ✅ Quiz
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'statistics' ? 'active' : ''}`}
              onClick={() => setCurrentPage('statistics')}
            >
              📊 Statistics
            </button>
          </li>
        </ul>
      </nav>

      <main className="main-content">{renderPage()}</main>
    </div>
  );
};
