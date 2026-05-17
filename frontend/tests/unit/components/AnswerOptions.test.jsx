import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnswerOptions } from '../../../src/components/Quiz/AnswerOptions';
import { QuizQuestion } from '../../../src/components/Quiz/QuizQuestion';

describe('AnswerOptions Component (T067)', () => {
  const mockOptions = ['Water', 'Fire', 'Earth', 'Air'];

  it('renders 4 answer buttons', () => {
    const onSelectAnswer = vi.fn();

    render(
      <AnswerOptions
        options={mockOptions}
        onSelectAnswer={onSelectAnswer}
        selectedIndex={null}
        correctIndex={0}
        showFeedback={false}
        disabled={false}
      />
    );

    // Check for all 4 options
    expect(screen.getByText('A.')).toBeInTheDocument();
    expect(screen.getByText('B.')).toBeInTheDocument();
    expect(screen.getByText('C.')).toBeInTheDocument();
    expect(screen.getByText('D.')).toBeInTheDocument();

    // Check for all option texts
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Earth')).toBeInTheDocument();
    expect(screen.getByText('Air')).toBeInTheDocument();
  });

  it('handles answer selection', async () => {
    const user = userEvent.setup();
    const onSelectAnswer = vi.fn();

    render(
      <AnswerOptions
        options={mockOptions}
        onSelectAnswer={onSelectAnswer}
        selectedIndex={null}
        correctIndex={0}
        showFeedback={false}
        disabled={false}
      />
    );

    const waterButton = screen.getByRole('button', { name: /Option A.*Water/ });
    await user.click(waterButton);

    expect(onSelectAnswer).toHaveBeenCalledWith(0);
  });

  it('does not show inline feedback panel (feedback deferred to results screen)', () => {
    const onSelectAnswer = vi.fn();

    render(
      <AnswerOptions
        options={mockOptions}
        onSelectAnswer={onSelectAnswer}
        selectedIndex={0}
        correctIndex={0}
        showFeedback={false}
        disabled={true}
      />
    );

    expect(screen.queryByText('✓ Correct!')).not.toBeInTheDocument();
    expect(screen.queryByText(/You selected the right answer/)).not.toBeInTheDocument();
  });

  it('does not show incorrect feedback panel during quiz', () => {
    const onSelectAnswer = vi.fn();

    render(
      <AnswerOptions
        options={mockOptions}
        onSelectAnswer={onSelectAnswer}
        selectedIndex={2}
        correctIndex={0}
        showFeedback={false}
        disabled={true}
      />
    );

    expect(screen.queryByText('✗ Incorrect')).not.toBeInTheDocument();
    expect(screen.queryByText(/The correct answer is/)).not.toBeInTheDocument();
  });

  it('disables buttons after answer selection', async () => {
    const user = userEvent.setup();
    const onSelectAnswer = vi.fn();

    render(
      <AnswerOptions
        options={mockOptions}
        onSelectAnswer={onSelectAnswer}
        selectedIndex={0}
        correctIndex={0}
        showFeedback={true}
        disabled={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('disabled');
    });
  });
});

describe('QuizQuestion Component (T068)', () => {
  const mockQuestion = {
    id: 'q_1',
    vocabulary_id: 1,
    question: 'What is the English meaning of: Wasser?',
    german_word: 'Wasser',
    english_meaning: 'Water',
    options: ['Water', 'Fire', 'Earth', 'Air'],
    correct_answer_index: 0,
  };

  it('renders question text', () => {
    const onNextQuestion = vi.fn();
    const onAnswerSelected = vi.fn();

    render(
      <QuizQuestion
        question={mockQuestion}
        currentIndex={0}
        totalQuestions={10}
        onNextQuestion={onNextQuestion}
        onAnswerSelected={onAnswerSelected}
      />
    );

    expect(screen.getByText(mockQuestion.question)).toBeInTheDocument();
    expect(screen.getByText(mockQuestion.german_word)).toBeInTheDocument();
  });

  it('displays progress indicator', () => {
    const onNextQuestion = vi.fn();
    const onAnswerSelected = vi.fn();

    render(
      <QuizQuestion
        question={mockQuestion}
        currentIndex={4}
        totalQuestions={10}
        onNextQuestion={onNextQuestion}
        onAnswerSelected={onAnswerSelected}
      />
    );

    expect(screen.getByText(/Question 5 of 10/)).toBeInTheDocument();
  });

  it('shows next button after answer is selected', async () => {
    const user = userEvent.setup();
    const onNextQuestion = vi.fn();
    const onAnswerSelected = vi.fn();

    render(
      <QuizQuestion
        question={mockQuestion}
        currentIndex={0}
        totalQuestions={10}
        onNextQuestion={onNextQuestion}
        onAnswerSelected={onAnswerSelected}
      />
    );

    // Initially no next button
    expect(screen.queryByText('Next Question')).not.toBeInTheDocument();

    // Select an answer
    const waterButton = screen.getByRole('button', { name: /Option A.*Water/ });
    await user.click(waterButton);

    // Now next button appears
    await waitFor(() => {
      expect(screen.getByText('Next Question →')).toBeInTheDocument();
    });
  });

  it('shows "See Results" button on last question', () => {
    const onNextQuestion = vi.fn();
    const onAnswerSelected = vi.fn();

    const { rerender } = render(
      <QuizQuestion
        question={mockQuestion}
        currentIndex={0}
        totalQuestions={1}
        onNextQuestion={onNextQuestion}
        onAnswerSelected={onAnswerSelected}
      />
    );

    // Select answer to show next button
    const waterButton = screen.getByRole('button', { name: /Option A.*Water/ });
    fireEvent.click(waterButton);

    expect(screen.getByText('See Results →')).toBeInTheDocument();
  });

  it('calls onAnswerSelected when answer is submitted', async () => {
    const user = userEvent.setup();
    const onNextQuestion = vi.fn();
    const onAnswerSelected = vi.fn();

    render(
      <QuizQuestion
        question={mockQuestion}
        currentIndex={0}
        totalQuestions={10}
        onNextQuestion={onNextQuestion}
        onAnswerSelected={onAnswerSelected}
      />
    );

    const waterButton = screen.getByRole('button', { name: /Option A.*Water/ });
    await user.click(waterButton);

    expect(onAnswerSelected).toHaveBeenCalledWith(0);
  });

  it('calls onNextQuestion when next button is clicked', async () => {
    const user = userEvent.setup();
    const onNextQuestion = vi.fn();
    const onAnswerSelected = vi.fn();

    render(
      <QuizQuestion
        question={mockQuestion}
        currentIndex={0}
        totalQuestions={10}
        onNextQuestion={onNextQuestion}
        onAnswerSelected={onAnswerSelected}
      />
    );

    // Select answer
    const waterButton = screen.getByRole('button', { name: /Option A.*Water/ });
    await user.click(waterButton);

    // Click next
    const nextButton = screen.getByText('Next Question →');
    await user.click(nextButton);

    expect(onNextQuestion).toHaveBeenCalled();
  });
});
