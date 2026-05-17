import { colors } from '../../services/colors';

export const AnswerOptions = ({ 
  options, 
  onSelectAnswer, 
  selectedIndex, 
  correctIndex, 
  showFeedback,
  disabled,
  reviewMode = false,
}) => {
  const buttonLabels = ['A', 'B', 'C', 'D'];

  const getButtonStyle = (index) => {
    const baseStyle = {
      width: '100%',
      padding: '1rem',
      margin: '0.5rem 0',
      fontSize: '1rem',
      fontWeight: '500',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      opacity: disabled ? 0.7 : 1,
    };

    if (selectedIndex === index && !reviewMode) {
      // Selected during quiz — highlight blue only, no correctness colouring
      return {
        ...baseStyle,
        backgroundColor: colors.PRIMARY,
        color: '#fff',
        transform: 'scale(1.02)',
        boxShadow: `0 2px 8px rgba(37, 99, 235, 0.3)`
      };
    }

    if (reviewMode) {
      if (index === correctIndex) {
        return {
          ...baseStyle,
          backgroundColor: colors.SUCCESS,
          color: '#fff',
          boxShadow: `0 2px 8px rgba(16, 185, 129, 0.3)`
        };
      } else if (index === selectedIndex && selectedIndex !== correctIndex) {
        return {
          ...baseStyle,
          backgroundColor: colors.ERROR,
          color: '#fff',
          boxShadow: `0 2px 8px rgba(239, 68, 68, 0.3)`
        };
      }
    }

    // Default
    return {
      ...baseStyle,
      backgroundColor: colors.BACKGROUND,
      color: colors.TEXT,
      border: `2px solid ${colors.BORDER}`,
    };
  };

  const handleClick = (index) => {
    if (!disabled && !showFeedback) {
      onSelectAnswer(index);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ color: colors.TEXT, fontWeight: '600', marginBottom: '1rem' }}>
        Select your answer:
      </div>
      <div>
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            style={getButtonStyle(index)}
            disabled={disabled}
            aria-label={`Option ${buttonLabels[index]}: ${option}`}
            aria-pressed={selectedIndex === index}
          >
            <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>
              {buttonLabels[index]}.
            </span>
            <span>{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
