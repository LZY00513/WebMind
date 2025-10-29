import React, { useEffect, useState } from 'react';
import { Note, MessageType } from '../shared/types';
import { checkAIAvailability } from '../shared/utils/ai';

const Popup: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState<'available' | 'downloadable' | 'downloading' | 'unavailable'>('unavailable');

  useEffect(() => {
    loadNotes();
    checkAI();
  }, []);

  // Load notes
  const loadNotes = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.GET_NOTES,
      });
      setNotes(response.notes || []);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check AI status
  const checkAI = async () => {
    try {
      const status = await checkAIAvailability();
      setAiStatus(status);
    } catch (error) {
      console.error('Failed to check AI status:', error);
    }
  };

  // Add note
  const handleAddNote = async () => {
    console.log('🟣 Add note button clicked');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('🟣 Sending message to tab:', tab);

      if (!tab?.id) {
        console.error('❌ Unable to get current tab');
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'addNote' });
      console.log('🟢 Received response:', response);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  };

  // Open side panel
  const openSidePanel = () => {
    chrome.runtime.sendMessage({
      type: MessageType.OPEN_SIDEPANEL,
    });
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    try {
      await chrome.runtime.sendMessage({
        type: MessageType.DELETE_NOTE,
        payload: { id },
      });
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  return (
    <div className="popup-container">
      {/* Header */}
      <div className="popup-header">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4L4 8L12 12L20 8L12 4Z"
              fill="url(#gradient)"
            />
            <path
              d="M4 12L12 16L20 12"
              stroke="url(#gradient)"
              strokeWidth="2"
            />
            <defs>
              <linearGradient id="gradient" x1="4" y1="4" x2="20" y2="16">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
          <h1>WebMind</h1>
        </div>
        <p className="subtitle">AI-Powered Note Assistant</p>
      </div>

      {/* AI Status */}
      {aiStatus && (
        <div className="ai-status">
          <div className="status-item">
            <span className="status-label">Summary Feature:</span>
            <span className={`status-badge ${aiStatus === 'available' ? 'ready' : 'unavailable'}`}>
              {aiStatus === 'available'
                ? '✓ Available'
                : aiStatus === 'downloadable'
                ? '⬇ Download Required'
                : aiStatus === 'downloading'
                ? '⏳ Downloading'
                : '✗ Unavailable'}
            </span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="instructions">
        <p>💡 Select text on any webpage and click 'Add to Notes' to collect content</p>
      </div>

      {/* Notes Status */}
      <div className="notes-status">
        <div className="status-row">
          <div className="status-item">
            <span className="status-label">Pending</span>
            <span className="status-value highlight">
              {notes.filter(note => note.status === 'pending').length}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Summarized</span>
            <span className="status-value">
              {notes.filter(note => note.status === 'summarized').length}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Connected</span>
            <span className="status-value">
              {notes.filter(note => note.status === 'connected').length}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Notes */}
      <div className="notes-section">
        <div className="section-header">
          <h2>Recent</h2>
          <span className="count">{notes.length}</span>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <p>No notes yet</p>
            <p className="hint">Start selecting text to create your first note!</p>
          </div>
        ) : (
          <div className="notes-list">
            {notes.slice(0, 3).map((note) => (
              <div key={note.id} className={`note-item ${note.status}`}>
                <div className="note-content">
                  <div className="note-title">{note.title}</div>
                  <div className="note-text">
                    {note.status === 'pending' ? (
                      note.content.slice(0, 100) + '...'
                    ) : (
                      note.summary
                    )}
                  </div>
                  <div className="note-meta">
                    <span className="note-date">
                      {new Date(note.timestamp).toLocaleDateString('en-US')}
                    </span>
                    <span className="note-status">
                      {note.status === 'pending' ? 'Pending' :
                       note.status === 'summarized' ? 'Summarized' :
                       'Connected'}
                    </span>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteNote(note.id)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="popup-footer">
        <button className="primary-btn" onClick={handleAddNote}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L2 6L8 10L14 6L8 2Z" fill="currentColor"/>
            <path d="M2 10L8 14L14 10" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          Add to Notes
        </button>
        <button className="secondary-btn" onClick={openSidePanel}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4H14M2 8H14M2 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          View All Notes & Mind Map
        </button>
      </div>
    </div>
  );
};

export default Popup;

