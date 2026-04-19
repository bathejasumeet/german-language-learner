import { useState } from 'react';
import { AnswerOptions } from './AnswerOptions';
import { colors } from '../../services/colors';

export const QuizQuestion = ({ 
  question, 
  currentIndex, 
  totalQuestions,
  onNextQuestion,
  onAnswerSelected 
}) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelectAnswer = (index) => {
    setSelectedOptionIndex(index);
    setShowFeedback(true);
    
    // Notify parent component
    onAnswerSelected({
      question_id: question.id,
      selected_option_index: index,
      is_correct: index === question.correct_answer_index
    });
  };

  const handleNextQuestion = () => {
    setSelectedOptionIndex(null);
    setShowFeedback(false);
    onNextQuestion();
  };

  const progressStyle = {
    textAlign: 'center',
    marginBottom: '1rem',
    color: colors.NEUTRAL,
    fontSize: '0.9rem',
    fontWeight: '500'
  };

  const questionContainerStyle = {
    backgroundColor: colors.BACKGROUND,
    border: `2px solid ${colors.BORDER}`,
    borderRadius: '0.5rem',
    padding: '2rem',
    marginBottom: '2rem'
  };

  const questionStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: colors.TEXT,
    marginBottom: '1rem'
  };

  const germanWordStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: colors.PRIMARY,
    padding: '1rem',
    backgroundColor: '#f0f4ff',
    borderRadius: '0.375rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontStyle: 'italic'
  };

  const nextButtonStyle = {
    backgroundColor: showFeedback ? colors.PRIMARY : colors.NEUTRAL,
    color: '#fff',
    padding: '0.75rem 1.5rem',
    marginTop: '1.5rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: showFeedback ? 'pointer' : 'not-allowed',
    opacity: showFeedback ? 1 : 0.5,
    fontSize: '1rem',
    fontWeight: '500',
    width: '100%'
  };

  return (
    <div>
      <div style={progressStyle}>
        Question {currentIndex + 1} of {totalQuestions}
      </div>

      <div style={questionContainerStyle}>
        <div style={questionStyle}>{question.question}</div>

        <div style={germanWordStyle}>
          {question.german_word}
        </div>

        <AnswerOptions
          options={question.options}
          onSelectAnswer={handleSelectAnswer}
          selectedIndex={selectedOptionIndex}
          correctIndex={question.correct_answer_index}
          showFeedback={showFeedback}
          disabled={showFeedback}
        />

        {showFeedback && (
          <button
            onClick={handleNextQuestion}
            style={nextButtonStyle}
            aria-label={currentIndex < totalQuestions - 1 ? "Go to next question" : "See results"}
          >
            {currentIndex < totalQuestions - 1 ? 'Next Question →' : 'See Results →'}
          </button>
        )}
      </div>
    </div>
  );
};
