import { useState, useEffect } from 'react';
import { vocabularyService } from '../services/vocabulary';
import { rosettaService } from '../services/rosetta';
import './Rosetta.css';

export const Rosetta = () => {
  const [words, setWords] = useState([]);
  const [selectedWordId, setSelectedWordId] = useState('');
  const [result, setResult] = useState(null); // { sentences, german_word, cached }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    vocabularyService
      .getAllWords()
      .then((res) => setWords(res.data))
      .catch(() => setWords([]));
  }, []);

  const handleGenerate = async (force = false) => {
    if (!selectedWordId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await rosettaService.generate(Number(selectedWordId), force);
      setResult(res.data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 503) {
        setError(
          'The local AI service is not running. Please start Ollama and try again.'
        );
      } else if (status === 404) {
        setError('Word not found. Please refresh and try again.');
      } else {
        setError('Failed to generate sentences. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const hasResult = result && result.sentences && result.sentences.length > 0;

  return (
    <div className="rosetta-page">
      <h2>Rosetta</h2>
      <p className="rosetta-subtitle">
        Select a word to generate three memorable sentences that help you remember it.
      </p>

      <div className="rosetta-controls">
        {words.length === 0 ? (
          <p className="rosetta-empty">
            No words available. Add words in the Vocabulary tab.
          </p>
        ) : (
          <>
            <select
              className="rosetta-select"
              value={selectedWordId}
              onChange={(e) => {
                setSelectedWordId(e.target.value);
                setResult(null);
                setError(null);
              }}
              aria-label="Select a German word"
            >
              <option value="">— Select a word —</option>
              {words.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.german_word} — {w.meaning}
                </option>
              ))}
            </select>

            <button
              className="rosetta-btn primary"
              onClick={() => handleGenerate(false)}
              disabled={!selectedWordId || loading}
            >
              {loading ? 'Generating…' : 'Generate Memory Aids'}
            </button>
          </>
        )}
      </div>

      {loading && (
        <div className="rosetta-loading" role="status" aria-live="polite">
          <span className="rosetta-spinner" aria-hidden="true" />
          Asking Ollama…
        </div>
      )}

      {error && (
        <div className="rosetta-error" role="alert">
          <span>{error}</span>
          <button
            className="rosetta-btn secondary"
            onClick={() => handleGenerate(false)}
          >
            Retry
          </button>
        </div>
      )}

      {hasResult && !loading && (
        <div className="rosetta-result">
          <div className="rosetta-result-header">
            <h3>{result.german_word}</h3>
            {result.cached && (
              <span className="rosetta-badge" title="Returned from cache">
                From cache
              </span>
            )}
            <button
              className="rosetta-btn secondary"
              onClick={() => handleGenerate(true)}
            >
              Regenerate
            </button>
          </div>

          <ol className="rosetta-sentences">
            {result.sentences.map((sentence, i) => (
              <li key={i} className="rosetta-sentence-card">
                {sentence}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
