import { useState, useEffect } from 'react';
import { vocabularyService } from '../services/vocabulary';
import { colors } from '../services/colors';
import './VocabularyManager.css';

export const VocabularyManager = ({ onEditWord, onNavigateToVocab }) => {
  const [words, setWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    filterAndPaginateWords();
  }, [words, searchTerm, currentPage]);

  const loadWords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await vocabularyService.getAllWords(0, 1000);
      setWords(response.data);
    } catch (err) {
      setError('Failed to load vocabulary list');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginateWords = () => {
    let filtered = words;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = words.filter(
        (word) =>
          word.german_word.toLowerCase().includes(term) ||
          word.meaning.toLowerCase().includes(term)
      );
    }

    // Calculate pagination
    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    setTotalPages(total || 1);

    // Get current page items
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setFilteredWords(filtered.slice(start, end));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (word) => {
    setEditingId(word.id);
    setEditValues({
      german_word: word.german_word,
      meaning: word.meaning,
      example_sentence: word.example_sentence || ''
    });
  };

  const handleSaveEdit = async (wordId) => {
    try {
      await vocabularyService.updateWord(
        wordId,
        editValues.german_word,
        editValues.meaning,
        editValues.example_sentence
      );
      setEditingId(null);
      setEditValues({});
      loadWords();
      onEditWord && onEditWord();
    } catch (err) {
      setError('Failed to update word');
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleDeleteClick = (word) => {
    setShowDeleteConfirm(word);
  };

  const handleConfirmDelete = async (wordId) => {
    try {
      await vocabularyService.deleteWord(wordId);
      setShowDeleteConfirm(null);
      loadWords();
    } catch (err) {
      setError('Failed to delete word');
      console.error(err);
    }
  };

  const cardStyle = {
    backgroundColor: colors.BACKGROUND,
    border: `2px solid ${colors.BORDER}`,
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem',
    transition: 'all 0.2s ease'
  };

  const cardHoverStyle = {
    ...cardStyle,
    borderColor: colors.PRIMARY,
    boxShadow: `0 2px 8px rgba(37, 99, 235, 0.1)`
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  };

  const titleStyle = {
    color: colors.TEXT,
    fontSize: '1.5rem',
    fontWeight: 'bold'
  };

  const searchStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '0.375rem',
    border: `1px solid ${colors.BORDER}`,
    color: colors.TEXT,
    backgroundColor: colors.BACKGROUND
  };

  const buttonStyle = {
    backgroundColor: colors.PRIMARY,
    color: '#fff',
    padding: '0.5rem 1rem',
    marginRight: '0.5rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: colors.ERROR
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: colors.NEUTRAL
  };

  const successButtonStyle = {
    ...buttonStyle,
    backgroundColor: colors.SUCCESS
  };

  const wordContentStyle = {
    marginBottom: '0.75rem'
  };

  const labelStyle = {
    fontWeight: '600',
    color: colors.TEXT,
    fontSize: '0.875rem'
  };

  const valueStyle = {
    color: colors.NEUTRAL,
    marginLeft: '0.5rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
    border: `1px solid ${colors.BORDER}`,
    color: colors.TEXT,
    backgroundColor: colors.BACKGROUND,
    boxSizing: 'border-box'
  };

  if (loading) {
    return <div style={{ color: colors.TEXT }}>Loading vocabulary...</div>;
  }

  return (
    <div className="vocabulary-manager">
      <div style={headerStyle}>
        <h2 style={titleStyle}>Manage Vocabulary</h2>
        <button
          onClick={onNavigateToVocab}
          style={{
            ...successButtonStyle,
            marginRight: 0
          }}
        >
          + Create New Word
        </button>
      </div>

      {error && (
        <div style={{ color: colors.ERROR, marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Search by German word or meaning..."
        value={searchTerm}
        onChange={handleSearch}
        style={searchStyle}
      />

      {filteredWords.length === 0 ? (
        <div style={{ color: colors.NEUTRAL, padding: '2rem', textAlign: 'center' }}>
          {searchTerm ? 'No words match your search' : 'No vocabulary yet. Create one to get started!'}
        </div>
      ) : (
        <>
          <div style={{ marginTop: '1rem' }}>
            {filteredWords.map((word) => (
              <div
                key={word.id}
                style={cardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.PRIMARY;
                  e.currentTarget.style.boxShadow = `0 2px 8px rgba(37, 99, 235, 0.1)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.BORDER;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {editingId === word.id ? (
                  // Edit Mode
                  <div>
                    <div style={wordContentStyle}>
                      <label style={labelStyle}>German Word:</label>
                      <input
                        type="text"
                        value={editValues.german_word}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            german_word: e.target.value
                          })
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div style={wordContentStyle}>
                      <label style={labelStyle}>Meaning:</label>
                      <input
                        type="text"
                        value={editValues.meaning}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            meaning: e.target.value
                          })
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div style={wordContentStyle}>
                      <label style={labelStyle}>Example Sentence:</label>
                      <textarea
                        value={editValues.example_sentence}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            example_sentence: e.target.value
                          })
                        }
                        style={{
                          ...inputStyle,
                          minHeight: '60px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                        maxLength={500}
                      />
                      <div style={{ fontSize: '0.75rem', color: colors.NEUTRAL }}>
                        {editValues.example_sentence.length} / 500 characters
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                      <button
                        onClick={() => handleSaveEdit(word.id)}
                        style={successButtonStyle}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={cancelButtonStyle}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div style={wordContentStyle}>
                      <span style={labelStyle}>German:</span>
                      <span style={valueStyle}>{word.german_word}</span>
                    </div>

                    <div style={wordContentStyle}>
                      <span style={labelStyle}>Meaning:</span>
                      <span style={valueStyle}>{word.meaning}</span>
                    </div>

                    {word.example_sentence && (
                      <div style={wordContentStyle}>
                        <span style={labelStyle}>Example:</span>
                        <span style={valueStyle}>{word.example_sentence}</span>
                      </div>
                    )}

                    <div style={{ marginTop: '1rem' }}>
                      <button
                        onClick={() => handleEdit(word)}
                        style={buttonStyle}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(word)}
                        style={deleteButtonStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  ...buttonStyle,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <span style={{ color: colors.TEXT, padding: '0.5rem 1rem' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  ...buttonStyle,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: colors.BACKGROUND,
              borderRadius: '0.5rem',
              padding: '2rem',
              maxWidth: '400px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: `2px solid ${colors.BORDER}`
            }}
          >
            <h3 style={{ color: colors.TEXT, marginTop: 0 }}>
              Delete "{showDeleteConfirm.german_word}"?
            </h3>
            <p style={{ color: colors.NEUTRAL }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={cancelButtonStyle}
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(showDeleteConfirm.id)}
                style={deleteButtonStyle}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
