import { useState, useEffect } from 'react';
import { vocabularyService } from '../../services/vocabulary';
import { quizService } from '../../services/quiz';
import './QuizComponent.css';

export const QuizComponent = () => {
  const [words, setWords] = useState([]);
  const [quizState, setQuizState] = useState('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [quizId, setQuizId] = useState(null);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    setLoading(true);
    try {
      const response = await vocabularyService.getAllWords(0, 1000);
      setWords(response.data.slice(0, 100));
    } catch (err) {
      setError('Failed to load words');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    if (words.length === 0) {
      setError('No words available for quiz');
      return;
    }
    setLoading(true);
    try {
      const response = await quizService.createQuiz(totalQuestions);
      setQuizId(response.data.id);
      setQuizState('quiz');
      setCurrentQuestion(0);
      setScore(0);
      setAnswers([]);
      setError('');
    } catch (err) {
      setError('Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (isCorrect) => {
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);
    const newScore = score + (isCorrect ? 1 : 0);
    if (currentQuestion < totalQuestions - 1) {
      setScore(newScore);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      try {
        await quizService.submitQuiz(quizId, newScore);
        setScore(newScore);
        setQuizState('results');
      } catch (err) {
        setScore(newScore);
        setQuizState('results');
      }
    }
  };

  const getQuizOptions = () => {
    if (words.length < 4) return [];
    const correctWord = words[currentQuestion % words.length];
    const options = [correctWord];
    while (options.length < 4) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      if (!options.some((w) => w.id === randomWord.id)) {
        options.push(randomWord);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  if (loading && quizState === 'start') {
    return <div className="quiz-status" role="status" aria-live="polite">Loading...</div>;
  }

  if (quizState === 'start') {
    return (
      <div className="quiz-start">
        <h2>German Language Quiz</h2>
        {error && <div className="quiz-error" role="alert" aria-live="assertive">{error}</div>}
        <div className="quiz-form-group">
          <label htmlFor="questions">Number of Questions</label>
          <select
            id="questions"
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(Math.min(words.length, parseInt(e.target.value)))}
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <p className="quiz-available">Available words: {words.length}</p>
        <button onClick={startQuiz} disabled={words.length === 0} className="btn-primary">
          Start Quiz
        </button>
      </div>
    );
  }

  if (quizState === 'quiz') {
    const options = getQuizOptions();
    const correctWord = words[currentQuestion % words.length];
    return (
      <div className="quiz-container">
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          />
        </div>
        <p className="quiz-counter">Question {currentQuestion + 1} of {totalQuestions}</p>
        <div className="quiz-question">
          <p>What is the meaning of</p>
          <strong className="quiz-word">{correctWord.german_word}</strong>
        </div>
        <div className="quiz-options" role="group" aria-label="Answer options">
          {options.map((word) => (
            <button
              key={word.id}
              className="quiz-option-btn"
              onClick={() => handleAnswer(word.id === correctWord.id)}
            >
              {word.meaning}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (quizState === 'results') {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
      <div className="quiz-results">
        <h2>Quiz complete</h2>
        <div className="quiz-score">
          <span className="quiz-score-pct">{percentage}%</span>
          <span className="quiz-score-text">{score} of {totalQuestions} correct</span>
        </div>
        <button onClick={() => setQuizState('start')} className="btn-primary">Take Another Quiz</button>
      </div>
    );
  }
};
