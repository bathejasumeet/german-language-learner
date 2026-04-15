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
    return <div className="loading">Loading statistics...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!stats) {
    return <div className="no-data">No statistics available yet.</div>;
  }

  return (
    <div className="statistics">
      <h2>Your Learning Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Words</div>
          <div className="stat-value">{stats.total_words}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Quizzes</div>
          <div className="stat-value">{stats.total_quizzes}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Average Quiz Score</div>
          <div className="stat-value">{stats.average_quiz_score}%</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Reviews</div>
          <div className="stat-value">{stats.total_reviews}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Overall Accuracy</div>
          <div className="stat-value">{stats.overall_accuracy}%</div>
        </div>
      </div>

      <button onClick={fetchStatistics}>Refresh Statistics</button>
    </div>
  );
};
