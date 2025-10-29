import React from 'react';
import { Note } from '../shared/types';

interface StatisticsProps {
  notes: Note[];
}

const Statistics: React.FC<StatisticsProps> = ({ notes }) => {
  // Calculate statistics
  const totalNotes = notes.length;
  const pendingCount = notes.filter(n => n.status === 'pending').length;
  const summarizedCount = notes.filter(n => n.status === 'summarized').length;
  const connectedCount = notes.filter(n => n.status === 'connected').length;

  // Count tags
  const tagCounts = notes
    .flatMap(n => n.tags || [])
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Notes per day (last 7 days)
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentNotes = notes.filter(n => n.timestamp >= sevenDaysAgo);

  const notesPerDay = Array.from({ length: 7 }, (_, i) => {
    const dayStart = now - i * 24 * 60 * 60 * 1000;
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    return {
      day: new Date(dayStart).toLocaleDateString('en-US', { weekday: 'short' }),
      count: notes.filter(n => n.timestamp >= dayStart && n.timestamp < dayEnd).length,
    };
  }).reverse();

  const maxCount = Math.max(...notesPerDay.map(d => d.count), 1);

  // Average notes per day
  const avgNotesPerDay = (recentNotes.length / 7).toFixed(1);

  return (
    <div className="statistics-container">
      <h2 className="stats-title">📊 Statistics Dashboard</h2>

      {/* Overview Cards */}
      <div className="stats-cards">
        <div className="stat-card total">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-value">{totalNotes}</div>
            <div className="stat-label">Total Notes</div>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        
        <div className="stat-card summarized">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{summarizedCount}</div>
            <div className="stat-label">Summarized</div>
          </div>
        </div>
        
        <div className="stat-card connected">
          <div className="stat-icon">🔗</div>
          <div className="stat-info">
            <div className="stat-value">{connectedCount}</div>
            <div className="stat-label">Connected</div>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="stats-section">
        <h3 className="section-title">📈 Activity (Last 7 Days)</h3>
        <div className="activity-chart">
          {notesPerDay.map((day, i) => (
            <div key={i} className="chart-bar-container">
              <div className="chart-bar-wrapper">
                <div 
                  className="chart-bar"
                  style={{ 
                    height: `${(day.count / maxCount) * 100}%`,
                    minHeight: day.count > 0 ? '4px' : '0'
                  }}
                >
                  {day.count > 0 && <span className="bar-value">{day.count}</span>}
                </div>
              </div>
              <div className="chart-label">{day.day}</div>
            </div>
          ))}
        </div>
        <div className="avg-stat">
          Average: <strong>{avgNotesPerDay}</strong> notes/day
        </div>
      </div>

      {/* Top Tags */}
      {topTags.length > 0 && (
        <div className="stats-section">
          <h3 className="section-title">🏷️ Top Tags</h3>
          <div className="tag-stats">
            {topTags.map(([tag, count]) => (
              <div key={tag} className="tag-stat-item">
                <div className="tag-stat-header">
                  <span className="tag-stat-name">#{tag}</span>
                  <span className="tag-stat-count">{count}</span>
                </div>
                <div className="tag-stat-bar">
                  <div 
                    className="tag-stat-fill"
                    style={{ width: `${(count / topTags[0][1]) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Rate */}
      <div className="stats-section">
        <h3 className="section-title">🎯 Completion Rate</h3>
        <div className="completion-stats">
          <div className="completion-bar-wrapper">
            <div className="completion-segments">
              {totalNotes > 0 && (
                <>
                  {summarizedCount > 0 && (
                    <div 
                      className="completion-segment summarized"
                      style={{ width: `${(summarizedCount / totalNotes) * 100}%` }}
                      title={`Summarized: ${((summarizedCount / totalNotes) * 100).toFixed(1)}%`}
                    />
                  )}
                  {connectedCount > 0 && (
                    <div 
                      className="completion-segment connected"
                      style={{ width: `${(connectedCount / totalNotes) * 100}%` }}
                      title={`Connected: ${((connectedCount / totalNotes) * 100).toFixed(1)}%`}
                    />
                  )}
                  {pendingCount > 0 && (
                    <div 
                      className="completion-segment pending"
                      style={{ width: `${(pendingCount / totalNotes) * 100}%` }}
                      title={`Pending: ${((pendingCount / totalNotes) * 100).toFixed(1)}%`}
                    />
                  )}
                </>
              )}
            </div>
          </div>
          <div className="completion-legend">
            <div className="legend-item">
              <div className="legend-color summarized"></div>
              <span>Summarized ({((summarizedCount / totalNotes) * 100).toFixed(0)}%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color connected"></div>
              <span>Connected ({((connectedCount / totalNotes) * 100).toFixed(0)}%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color pending"></div>
              <span>Pending ({((pendingCount / totalNotes) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

