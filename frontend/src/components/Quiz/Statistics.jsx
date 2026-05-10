import { useState, useEffect } from 'react';
import { quizService } from '../../services/quiz';
import './Statistics.css';

export const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await quizService.getUserStatistics();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="stats-status" role="status" aria-live="polite">Loading statistics...</div>;
  }

  if (error) {
    return <div className="stats-status stats-error" role="alert">{error}</div>;
  }

  const isEmpty = !stats || (
    stats.total_quizzes === 0 && stats.total_reviews === 0
  );

  if (isEmpty) {
    return (
      <div className="stats-empty">
        <p>No statistics available yet — complete a quiz to see your progress.</p>
      </div>
    );
  }

  return (
    <div className="statistics">
      <h2>Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Words</span>
          <span className="stat-value">{stats.total_words}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Quizzes Taken</span>
          <span className="stat-value">{stats.total_quizzes}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average Score</span>
          <span className="stat-value">{stats.average_quiz_score}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Reviews</span>
          <span className="stat-value">{stats.total_reviews}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Overall Accuracy</span>
          <span className="stat-value">{stats.overall_accuracy}%</span>
        </div>
      </div>
      <button onClick={fetchStatistics} className="btn-secondary">Refresh</button>
    </div>
  );
};
