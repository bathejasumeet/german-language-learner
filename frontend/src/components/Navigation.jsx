import { useState } from 'react';
import { Vocabulary } from '../pages/Vocabulary';
import { WordsTab } from '../pages/WordsTab';
import { QuizComponent } from '../components/Quiz/QuizComponent';
import { Statistics } from '../components/Quiz/Statistics';
import { FlashcardStudy } from '../components/Flashcards/FlashcardStudy';
import './Navigation.css';

const TABS = [
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'words',      label: 'Words' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'quiz',       label: 'Quiz' },
  { id: 'statistics', label: 'Statistics' },
];

export const Navigation = () => {
  const [currentPage, setCurrentPage] = useState('vocabulary');

  const renderPage = () => {
    switch (currentPage) {
      case 'vocabulary':  return <Vocabulary />;
      case 'words':       return <WordsTab />;
      case 'flashcards':  return <FlashcardStudy />;
      case 'quiz':        return <QuizComponent />;
      case 'statistics':  return <Statistics />;
      default:            return <Vocabulary />;
    }
  };

  return (
    <div className="app">
      <header className="site-header">
        <span className="site-title">German Learner</span>
        <nav className="tab-nav" role="navigation" aria-label="Main navigation">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              className={`tab-btn${currentPage === id ? ' active' : ''}`}
              onClick={() => setCurrentPage(id)}
              aria-current={currentPage === id ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main className="page-content" role="main">
        {renderPage()}
      </main>
    </div>
  );
};
