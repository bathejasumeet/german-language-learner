import { useState, useEffect } from 'react';
import { vocabularyService } from '../../services/vocabulary';
import { quizService } from '../../services/quiz';
import './QuizComponent.css';

export const QuizComponent = () => {
  const [words, setWords] = useState([]);
  const [quizState, setQuizState] = useState('start'); // start, quiz, results
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
      setWords(response.data.slice(0, 100)); // Limit to 100 for quiz
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

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete
      try {
        await quizService.submitQuiz(quizId, score + (isCorrect ? 1 : 0));
        setQuizState('results');
      } catch (err) {
        setError('Failed to submit quiz');
      }
    }
  };

  const getRandomWord = () => {
    return words[Math.floor(Math.random() * words.length)];
  };

  const getQuizOptions = () => {
    if (words.length < 4) return [];

    const correctWord = words[currentQuestion % words.length];
    const options = [correctWord];

    while (options.length < 4) {
      const randomWord = getRandomWord();
      if (!options.some((w) => w.id === randomWord.id)) {
        options.push(randomWord);
      }
    }

    return options.sort(() => Math.random() - 0.5);
  };

  if (loading && quizState === 'start') {
    return <div className="loading">Loading words...</div>;
  }

  if (quizState === 'start') {
    return (
      <div className="quiz-start">
        <h2>German Language Quiz</h2>
        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label htmlFor="questions">Number of Questions:</label>
          <select
            id="questions"
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(Math.min(words.length, parseInt(e.target.value)))}
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <p>Available words: {words.length}</p>
        <button onClick={startQuiz} disabled={words.length === 0}>
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
        <div className="quiz-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
              }}
            ></div>
          </div>
          <p>
            Question {currentQuestion + 1} of {totalQuestions}
          </p>
        </div>

        <div className="quiz-question">
          <h3>What is the meaning of "{correctWord.german_word}"?</h3>

          <div className="options">
            {options.map((word) => (
              <button
                key={word.id}
                className="option-btn"
                onClick={() => handleAnswer(word.id === correctWord.id)}
              >
                {word.meaning}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (quizState === 'results') {
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="quiz-results">
        <h2>Quiz Complete! 🎉</h2>
        <div className="score-card">
          <div className="score-display">
            <div className="score-number">{percentage}%</div>
            <div className="score-text">
              {score} out of {totalQuestions} correct
            </div>
          </div>

          {percentage >= 80 && <p className="message excellent">Excellent! Keep it up!</p>}
          {percentage >= 60 && percentage < 80 && <p className="message good">Good job! Keep practicing!</p>}
          {percentage < 60 && <p className="message practice">Keep practicing to improve!</p>}
        </div>

        <button onClick={() => setQuizState('start')}>Take Another Quiz</button>
      </div>
    );
  }
};
