import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Rosetta } from '../../src/pages/Rosetta';
import { vocabularyService } from '../../src/services/vocabulary';
import { rosettaService } from '../../src/services/rosetta';

vi.mock('../../src/services/vocabulary');
vi.mock('../../src/services/rosetta');

const mockWords = [
  { id: 1, german_word: 'Fenster', meaning: 'window' },
  { id: 2, german_word: 'Hund', meaning: 'dog' },
];

const mockResult = {
  word_id: 1,
  german_word: 'Fenster',
  sentences: [
    'Imagine a fence with a star — Fenster!',
    'The Fenster fogged up on a cold night.',
    'Fan + star = Fenster in a window frame.',
  ],
  generated_at: '2026-05-11T10:00:00Z',
  cached: false,
};

describe('Rosetta page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vocabularyService.getAllWords.mockResolvedValue({ data: mockWords });
  });

  it('renders the page heading', async () => {
    render(<Rosetta />);
    expect(await screen.findByText('Rosetta')).toBeInTheDocument();
  });

  it('renders word selector after words load', async () => {
    render(<Rosetta />);
    const select = await screen.findByLabelText('Select a German word');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Fenster — window')).toBeInTheDocument();
  });

  it('shows empty state when vocabulary is empty', async () => {
    vocabularyService.getAllWords.mockResolvedValue({ data: [] });
    render(<Rosetta />);
    expect(
      await screen.findByText(/No words available/i)
    ).toBeInTheDocument();
  });

  it('calls rosettaService.generate on button click', async () => {
    rosettaService.generate.mockResolvedValue({ data: mockResult });
    render(<Rosetta />);

    const select = await screen.findByLabelText('Select a German word');
    fireEvent.change(select, { target: { value: '1' } });

    fireEvent.click(screen.getByText('Generate Memory Aids'));
    expect(rosettaService.generate).toHaveBeenCalledWith(1, false);
  });

  it('renders three sentence cards after successful generation', async () => {
    rosettaService.generate.mockResolvedValue({ data: mockResult });
    render(<Rosetta />);

    const select = await screen.findByLabelText('Select a German word');
    fireEvent.change(select, { target: { value: '1' } });
    fireEvent.click(screen.getByText('Generate Memory Aids'));

    await waitFor(() => {
      expect(screen.getByText(/Imagine a fence with a star/)).toBeInTheDocument();
    });
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('shows "From cache" badge when cached=true', async () => {
    rosettaService.generate.mockResolvedValue({
      data: { ...mockResult, cached: true },
    });
    render(<Rosetta />);
    const select = await screen.findByLabelText('Select a German word');
    fireEvent.change(select, { target: { value: '1' } });
    fireEvent.click(screen.getByText('Generate Memory Aids'));

    await waitFor(() => {
      expect(screen.getByText('From cache')).toBeInTheDocument();
    });
  });

  it('shows error alert when API returns 503', async () => {
    rosettaService.generate.mockRejectedValue({
      response: { status: 503 },
    });
    render(<Rosetta />);
    const select = await screen.findByLabelText('Select a German word');
    fireEvent.change(select, { target: { value: '1' } });
    fireEvent.click(screen.getByText('Generate Memory Aids'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Ollama/i)).toBeInTheDocument();
    });
  });

  it('calls rosettaService.generate with force=true on Regenerate click', async () => {
    rosettaService.generate.mockResolvedValue({ data: mockResult });
    render(<Rosetta />);
    const select = await screen.findByLabelText('Select a German word');
    fireEvent.change(select, { target: { value: '1' } });
    fireEvent.click(screen.getByText('Generate Memory Aids'));

    await waitFor(() =>
      expect(screen.getByText('Regenerate')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText('Regenerate'));
    expect(rosettaService.generate).toHaveBeenLastCalledWith(1, true);
  });
});
