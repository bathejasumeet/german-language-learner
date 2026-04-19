import { useState, useEffect } from 'react';
import { QuizQuestion } from '../components/Quiz/QuizQuestion';
import { quizService } from '../services/quizService';
import { colors } from '../services/colors';

export const QuizTab = () => {
  const [quizState, setQuizState] = useState('initial'); // initial, loading, active, completed
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizResults, setQuizResults] = useState([]);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(10);
  const [startTime, setStartTime] = useState(null);

  const handleGenerateQuiz = async (questionCount) => {
    setQuizState('loading');
    setError('');
    
    try {
      const response = await quizService.generateQuiz(questionCount);
      setQuizData(response.data);
      setQuizResults([]);
      setScore(0);
      setCurrentQuestionIndex(0);
      setStartTime(Date.now());
      setQuizState('active');
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to generate quiz. Please make sure you have at least 4 vocabulary entries.';
      setError(message);
      setQuizState('initial');
    }
  };

  const handleAnswerSelected = (result) => {
    setQuizResults([...quizResults, result]);
    if (result.is_correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      await completeQuiz(durationSeconds);
    }
  };

  const completeQuiz = async (durationSeconds) => {
    try {
      const response = await quizService.completeQuiz(
        quizData.quiz_id,
        score,
        quizData.total_questions,
        quizData.questions.map(q => q.vocabulary_id),
        quizResults,
        durationSeconds
      );
      setQuizState('completed');
    } catch (err) {
      setError('Failed to complete quiz');
    }
  };

  const handleRetakeQuiz = () => {
    setQuizState('initial');
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setQuizResults([]);
    setScore(0);
    setError('');
  };

  // Initial screen
  if (quizState === 'initial') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: colors.TEXT, textAlign: 'center', marginBottom: '2rem' }}>
          🎯 Multiple-Choice Quiz
        </h1>

        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              color: colors.ERROR,
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              borderLeft: `4px solid ${colors.ERROR}`
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            backgroundColor: colors.BACKGROUND,
            border: `2px solid ${colors.BORDER}`,
            borderRadius: '0.5rem',
            padding: '2rem'
          }}
        >
          <p style={{ color: colors.NEUTRAL, marginBottom: '1.5rem' }}>
            Test your German vocabulary with this multiple-choice quiz. Each question has 4 options to choose from.
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: colors.TEXT, fontWeight: '600', marginBottom: '0.5rem' }}>
              Number of Questions:
            </label>
            <select
              value={selectedQuestionCount}
              onChange={(e) => setSelectedQuestionCount(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: `1px solid ${colors.BORDER}`,
                fontSize: '1rem',
                color: colors.TEXT,
                backgroundColor: colors.BACKGROUND
              }}
            >
              {[5, 10, 15, 20].map(num => (
                <option key={num} value={num}>{num} questions</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleGenerateQuiz(selectedQuestionCount)}
            disabled={quizState === 'loading'}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: '600',
              backgroundColor: colors.PRIMARY,
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: quizState === 'loading' ? 'not-allowed' : 'pointer',
              opacity: quizState === 'loading' ? 0.6 : 1
            }}
          >
            {quizState === 'loading' ? 'Generating Quiz...' : 'Start Quiz →'}
          </button>
        </div>
      </div>
    );
  }

  // Loading screen
  if (quizState === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: colors.TEXT }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>Generating your quiz...</p>
      </div>
    );
  }

  // Active quiz screen
  if (quizState === 'active' && quizData) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
        <QuizQuestion
          question={quizData.questions[currentQuestionIndex]}
          currentIndex={currentQuestionIndex}
          totalQuestions={quizData.total_questions}
          onNextQuestion={handleNextQuestion}
          onAnswerSelected={handleAnswerSelected}
        />
      </div>
    );
  }

  // Completed screen
  if (quizState === 'completed') {
    const percentage = (score / quizData.total_questions * 100).toFixed(1);
    const allCorrect = score === quizData.total_questions;
    const mostlyCorrect = score > quizData.total_questions * 0.7;

    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: colors.TEXT, textAlign: 'center', marginBottom: '1rem' }}>
          {allCorrect ? '🎉 Perfect!' : mostlyCorrect ? '👏 Great Job!' : '💪 Good Effort!'}
        </h1>

        <div
          style={{
            backgroundColor: colors.BACKGROUND,
            border: `2px solid ${colors.PRIMARY}`,
            borderRadius: '0.5rem',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '2rem'
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: colors.PRIMARY,
              marginBottom: '0.5rem'
            }}
          >
            {score}/{quizData.total_questions}
          </div>

          <div style={{ fontSize: '1.5rem', color: colors.NEUTRAL, marginBottom: '1rem' }}>
            {percentage}%
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: colors.BORDER,
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '1.5rem'
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: percentage >= 70 ? colors.SUCCESS : percentage >= 50 ? '#f59e0b' : colors.ERROR,
                transition: 'width 0.5s ease'
              }}
            />
          </div>

          <p style={{ color: colors.NEUTRAL, marginBottom: '1rem' }}>
            {percentage >= 90 && 'Excellent performance! Keep it up!'}
            {percentage >= 70 && percentage < 90 && 'Good work! Review the questions you missed.'}
            {percentage >= 50 && percentage < 70 && 'Nice try! Practice more vocabulary to improve.'}
            {percentage < 50 && 'Keep practicing! Review your vocabulary and try again.'}
          </p>
        </div>

        <button
          onClick={handleRetakeQuiz}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            backgroundColor: colors.PRIMARY,
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Retake Quiz →
        </button>
      </div>
    );
  }
};
