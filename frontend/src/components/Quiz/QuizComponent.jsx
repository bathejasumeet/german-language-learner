import { useState, useEffect } from 'react';
import { vocabularyService } from '../../services/vocabulary';
import { quizService } from '../../services/quizService';
import { QuizQuestion } from './QuizQuestion';
import { colors } from '../../services/colors';
import './QuizComponent.css';

const MIN_WORDS = 10;

export const QuizComponent = ({ onNavigateToWords } = {}) => {
  const [words, setWords] = useState([]);
  const [quizState, setQuizState] = useState('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
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
    if (words.length < MIN_WORDS) {
      setError(`You need at least ${MIN_WORDS} words to take a quiz. You currently have ${words.length}.`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await quizService.generateQuiz(totalQuestions);
      setQuizId(response.data.quiz_id);
      setQuestions(response.data.questions);
      setCurrentQuestion(0);
      setScore(0);
      setUserAnswers([]);
      setQuizState('quiz');
    } catch (err) {
      setError('Failed to start quiz. Please ensure you have at least 10 words.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (selectedOptionIndex) => {
    const question = questions[currentQuestion];
    const isCorrect = selectedOptionIndex === question.correct_answer_index;
    setUserAnswers((prev) => [...prev, { question, selectedOptionIndex, isCorrect }]);
    setScore((prev) => prev + (isCorrect ? 1 : 0));
    // Question advancement happens in handleNextQuestion when user clicks Next
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Last question — transition to results and persist
      setQuizState('results');
    }
  };

  // Fire-and-forget persistence when quiz completes
  useEffect(() => {
    if (quizState === 'results' && quizId && userAnswers.length > 0) {
      quizService.completeQuiz(
        quizId,
        score,
        questions.length,
        questions.map((q) => q.vocabulary_id),
        userAnswers.map((a) => ({
          question_id: a.question.id,
          selected_option_index: a.selectedOptionIndex,
          is_correct: a.isCorrect,
        })),
        null
      ).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizState]);

  const resetQuiz = () => {
    setQuizState('start');
    setUserAnswers([]);
    setQuestions([]);
    setScore(0);
    setCurrentQuestion(0);
    setError('');
  };

  if (loading && quizState === 'start') {
    return <div className="quiz-status" role="status" aria-live="polite">Loading...</div>;
  }

  if (quizState === 'start') {
    if (!loading && words.length < MIN_WORDS) {
      return (
        <div className="quiz-start">
          <h2>German Language Quiz</h2>
          <div className="quiz-error" role="alert" aria-live="assertive">
            You need at least {MIN_WORDS} words to start a quiz. You currently have {words.length}.
            Please add more words first.
          </div>
          {onNavigateToWords && (
            <button onClick={onNavigateToWords} className="btn-secondary" style={{ marginTop: '1rem' }}>
              Go to Words
            </button>
          )}
        </div>
      );
    }
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
        <button onClick={startQuiz} disabled={loading} className="btn-primary">
          Start Quiz
        </button>
      </div>
    );
  }

  if (quizState === 'quiz') {
    const question = questions[currentQuestion];
    if (!question) return null;
    return (
      <div className="quiz-container">
        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-fill"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
        <QuizQuestion
          question={question}
          currentIndex={currentQuestion}
          totalQuestions={questions.length}
          onAnswerSelected={handleAnswer}
          onNextQuestion={handleNextQuestion}
        />
      </div>
    );
  }

  if (quizState === 'results') {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <div className="quiz-results">
        <h2>Quiz Complete</h2>
        <div className="quiz-score">
          <span className="quiz-score-pct">{percentage}%</span>
          <span className="quiz-score-text">{score} of {questions.length} correct</span>
        </div>

        <div style={{ marginTop: '2rem' }}>
          {userAnswers.map((answer, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem',
                marginBottom: '0.75rem',
                borderRadius: '0.5rem',
                border: `2px solid ${answer.isCorrect ? colors.SUCCESS : colors.ERROR}`,
                backgroundColor: answer.isCorrect ? '#ecfdf5' : '#fef2f2',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                <span style={{ color: answer.isCorrect ? colors.SUCCESS : colors.ERROR, marginRight: '0.5rem' }}>
                  {answer.isCorrect ? '✓' : '✗'}
                </span>
                {answer.question.german_word}
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                <span style={{ color: '#6b7280' }}>Your answer: </span>
                <span style={{ fontWeight: '500', color: answer.isCorrect ? colors.SUCCESS : colors.ERROR }}>
                  {answer.question.options[answer.selectedOptionIndex]}
                </span>
              </div>
              {!answer.isCorrect && (
                <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  <span style={{ color: '#6b7280' }}>Correct answer: </span>
                  <span style={{ fontWeight: '500', color: colors.SUCCESS }}>
                    {answer.question.options[answer.question.correct_answer_index]}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button onClick={resetQuiz} className="btn-primary">Take Another Quiz</button>
          {onNavigateToWords && (
            <button onClick={onNavigateToWords} className="btn-secondary">Go to Words</button>
          )}
        </div>
      </div>
    );
  }
};
