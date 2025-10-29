import React, { useEffect, useState } from 'react';
import { Note, MessageType } from '../shared/types';
import { useStore } from '../shared/store';
import MindMap from './MindMap';
import Statistics from './Statistics';

type ViewMode = 'notes' | 'mindmap' | 'statistics';

const SidePanel: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { notes, loading, loadNotes, removeNote } = useStore();

  useEffect(() => {
    loadNotes();

    // Listen for note updates
    const handleStorageChange = (changes: { [key: string]: any }, namespace: string) => {
      if (namespace === 'local' && changes.webmind_notes) {
        console.log('📥 Note update detected, reloading');
        loadNotes();
      }
    };

    // Listen for messages from background
    const handleMessage = (message: any, _sender: any, _sendResponse: any) => {
      if (message.type === 'NOTES_UPDATED') {
        console.log('📥 Received note update message');
        loadNotes();
      }
      // Don't return true as this message doesn't need async response
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup listeners (automatically cleaned on component unmount, kept for best practice)
    // Note: Chrome extension API listeners are automatically cleaned on page unload
    return () => {
      // Chrome API handles cleanup automatically
    };
  }, [loadNotes]);

  // Filter and sort notes
  const filteredAndSortedNotes = notes
    .filter((note) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        note.title.toLowerCase().includes(query) ||
        (note.summary?.toLowerCase().includes(query) ?? false) ||
        note.content.toLowerCase().includes(query);
      
      const matchesTag = !filterTag || (note.tags?.includes(filterTag) ?? false);
      
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          const statusOrder = { pending: 0, summarized: 1, connected: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || [])));

  // Group notes by status
  const pendingNotes = filteredAndSortedNotes.filter(note => note.status === 'pending');
  const summarizedNotes = filteredAndSortedNotes.filter(note => note.status === 'summarized');
  const connectedNotes = filteredAndSortedNotes.filter(note => note.status === 'connected');

  // Handle batch
  const handleBatchSummarize = async () => {
    if (selectedNotes.length === 0) return;
    
    setIsProcessing(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.SUMMARIZE_NOTES,
        payload: { noteIds: selectedNotes },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setSelectedNotes([]);
      loadNotes();
    } catch (error) {
      console.error('Batch summarize failed:', error);
      alert('Failed to batch summarize, please retry');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle note connection
  const handleConnectNotes = async () => {
    if (selectedNotes.length < 2) {
      alert('Please select at least two notes to connect');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.CONNECT_NOTES,
        payload: { noteIds: selectedNotes },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setSelectedNotes([]);
      loadNotes();
    } catch (error) {
      console.error('Failed to connect notes:', error);
      alert('Failed to connect notes, please retry');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete note
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await removeNote(id);
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    }
  };

  // Export notes
  const handleExport = () => {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webmind-notes-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import notes
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importedNotes: Note[] = JSON.parse(text);
        
        // Validate imported notes
        if (!Array.isArray(importedNotes)) {
          throw new Error('Invalid format: Expected an array of notes');
        }
        
        // Import notes by sending to background
        for (const note of importedNotes) {
          await chrome.runtime.sendMessage({
            type: MessageType.SAVE_NOTE,
            payload: note,
          });
        }
        
        loadNotes();
        alert(`Successfully imported ${importedNotes.length} notes!`);
      } catch (error) {
        console.error('Failed to import notes:', error);
        alert('Failed to import notes. Please check the file format.');
      }
    };
    input.click();
  };

  // Add tag to note
  const handleAddTag = async (noteId: string, tag: string) => {
    if (!tag.trim()) return;
    
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    const updatedTags = note.tags ? [...note.tags, tag.trim()] : [tag.trim()];
    
    try {
      await chrome.runtime.sendMessage({
        type: MessageType.UPDATE_NOTE,
        payload: { 
          id: noteId, 
          updates: { tags: updatedTags } 
        },
      });
      loadNotes();
      setNewTag('');
      setEditingNoteId(null);
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  // Remove tag from note
  const handleRemoveTag = async (noteId: string, tagToRemove: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.tags) return;
    
    const updatedTags = note.tags.filter(t => t !== tagToRemove);
    
    try {
      await chrome.runtime.sendMessage({
        type: MessageType.UPDATE_NOTE,
        payload: { 
          id: noteId, 
          updates: { tags: updatedTags } 
        },
      });
      loadNotes();
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  return (
    <div className="sidepanel-container">
      {/* Header */}
      <div className="sidepanel-header">
        <div className="header-top">
          <div className="logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 4L4 8L12 12L20 8L12 4Z" fill="url(#gradient)" />
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
          <div className="header-actions">
            <button className="export-btn" onClick={handleImport} title="Import Notes">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 8L12 3L7 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 3V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="export-btn" onClick={handleExport} title="Export Notes">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10L12 15L17 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15V3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="view-tabs">
          <button
            className={`tab ${viewMode === 'notes' ? 'active' : ''}`}
            onClick={() => setViewMode('notes')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Notes List
            <span className="badge">{notes.length}</span>
          </button>
          <button
            className={`tab ${viewMode === 'mindmap' ? 'active' : ''}`}
            onClick={() => setViewMode('mindmap')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="19" cy="5" r="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="5" cy="19" r="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="2" />
              <line x1="10" y1="10" x2="6" y2="6" stroke="currentColor" strokeWidth="2" />
              <line x1="14" y1="10" x2="18" y2="6" stroke="currentColor" strokeWidth="2" />
              <line x1="10" y1="14" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
              <line x1="14" y1="14" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
            </svg>
            Mind Map
          </button>
          <button
            className={`tab ${viewMode === 'statistics' ? 'active' : ''}`}
            onClick={() => setViewMode('statistics')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M6 20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Stats
          </button>
        </div>

        {/* Search Bar (only in notes view) */}
        {viewMode === 'notes' && (
          <>
            <div className="search-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="tag-filter">
                <button
                  className={`filter-tag ${!filterTag ? 'active' : ''}`}
                  onClick={() => setFilterTag('')}
                >
                  All
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className={`filter-tag ${filterTag === tag ? 'active' : ''}`}
                    onClick={() => setFilterTag(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
            
            {/* Sort Controls */}
            <div className="sort-controls">
              <span className="sort-label">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'status')}
                className="sort-select"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
              </select>
              <button 
                className="sort-order-btn"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  {sortOrder === 'asc' ? (
                    <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="sidepanel-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : viewMode === 'notes' ? (
          <div className="notes-view">
            {filteredAndSortedNotes.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3>No notes yet</h3>
                <p>Select text on any webpage and add to notes</p>
              </div>
            ) : (
              <div className="notes-container">
                {/* Batch action buttons */}
                {selectedNotes.length > 0 && (
                  <div className="batch-actions">
                    <button
                      className="action-btn"
                      onClick={handleBatchSummarize}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Generate Summary'}
                    </button>
                    <button
                      className="action-btn"
                      onClick={handleConnectNotes}
                      disabled={isProcessing || selectedNotes.length < 2}
                    >
                      Connect Notes
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => setSelectedNotes([])}
                    >
                      Cancel Selection
                    </button>
                  </div>
                )}

                {/* Pending notes */}
                {pendingNotes.length > 0 && (
                  <div className="notes-section">
                    <h3>Pending ({pendingNotes.length})</h3>
                    <div className="notes-grid">
                      {pendingNotes.map((note) => (
                        <div
                          key={note.id}
                          className={`note-card pending ${
                            selectedNotes.includes(note.id) ? 'selected' : ''
                          }`}
                          onClick={() => {
                            if (selectedNotes.includes(note.id)) {
                              setSelectedNotes(selectedNotes.filter(id => id !== note.id));
                            } else {
                              setSelectedNotes([...selectedNotes, note.id]);
                            }
                          }}
                        >
                          <div className="note-card-header">
                            <h3>{note.title}</h3>
                            <div className="note-card-actions">
                              <button
                                className="view-detail-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNote(note);
                                }}
                                title="View Details"
                              >
                                View
                              </button>
                              <button
                                className="delete-icon-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(note.id);
                                }}
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <p className="note-card-content">{note.content.slice(0, 200)}...</p>
                          
                          {/* Tags Section */}
                          <div className="note-tags">
                            {note.tags?.map(tag => (
                              <span key={tag} className="tag">
                                #{tag}
                                <button
                                  className="tag-remove"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveTag(note.id, tag);
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            {editingNoteId === note.id ? (
                              <div className="tag-input-container" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  className="tag-input"
                                  placeholder="Add tag..."
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddTag(note.id, newTag);
                                    } else if (e.key === 'Escape') {
                                      setEditingNoteId(null);
                                      setNewTag('');
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  className="tag-add-btn"
                                  onClick={() => handleAddTag(note.id, newTag)}
                                >
                                  Add
                                </button>
                              </div>
                            ) : (
                              <button
                                className="tag-add-icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingNoteId(note.id);
                                }}
                              >
                                + Tag
                              </button>
                            )}
                          </div>
                          
                          <div className="note-card-footer">
                            <span className="note-date">
                              {new Date(note.timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <a
                              href={note.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="note-url"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Source →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summarized notes */}
                {summarizedNotes.length > 0 && (
                  <div className="notes-section">
                    <h3>Summarized ({summarizedNotes.length})</h3>
                    <div className="notes-grid">
                      {summarizedNotes.map((note) => (
                        <div
                          key={note.id}
                          className={`note-card summarized ${
                            selectedNotes.includes(note.id) ? 'selected' : ''
                          }`}
                          onClick={() => {
                            if (selectedNotes.includes(note.id)) {
                              setSelectedNotes(selectedNotes.filter(id => id !== note.id));
                            } else {
                              setSelectedNotes([...selectedNotes, note.id]);
                            }
                          }}
                        >
                          <div className="note-card-header">
                            <h3>{note.title}</h3>
                            <div className="note-card-actions">
                              <button
                                className="view-detail-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNote(note);
                                }}
                                title="View Details"
                              >
                                View
                              </button>
                              <button
                                className="delete-icon-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(note.id);
                                }}
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <p className="note-card-summary">{note.summary}</p>
                          
                          {/* Tags Section */}
                          <div className="note-tags">
                            {note.tags?.map(tag => (
                              <span key={tag} className="tag">
                                #{tag}
                                <button
                                  className="tag-remove"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveTag(note.id, tag);
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            {editingNoteId === note.id ? (
                              <div className="tag-input-container" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  className="tag-input"
                                  placeholder="Add tag..."
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddTag(note.id, newTag);
                                    } else if (e.key === 'Escape') {
                                      setEditingNoteId(null);
                                      setNewTag('');
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  className="tag-add-btn"
                                  onClick={() => handleAddTag(note.id, newTag)}
                                >
                                  Add
                                </button>
                              </div>
                            ) : (
                              <button
                                className="tag-add-icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingNoteId(note.id);
                                }}
                              >
                                + Tag
                              </button>
                            )}
                          </div>
                          
                          <div className="note-card-footer">
                            <span className="note-date">
                              {new Date(note.timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <a
                              href={note.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="note-url"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Source →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected notes */}
                {connectedNotes.length > 0 && (
                  <div className="notes-section">
                    <h3>Connected ({connectedNotes.length})</h3>
                    <div className="notes-grid">
                      {connectedNotes.map((note) => (
                        <div
                          key={note.id}
                          className={`note-card connected ${
                            selectedNotes.includes(note.id) ? 'selected' : ''
                          }`}
                          onClick={() => {
                            if (selectedNotes.includes(note.id)) {
                              setSelectedNotes(selectedNotes.filter(id => id !== note.id));
                            } else {
                              setSelectedNotes([...selectedNotes, note.id]);
                            }
                          }}
                        >
                          <div className="note-card-header">
                            <h3>{note.title}</h3>
                            <div className="note-card-actions">
                              <button
                                className="view-detail-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNote(note);
                                }}
                                title="View Details"
                              >
                                View
                              </button>
                              <button
                                className="delete-icon-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(note.id);
                                }}
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <p className="note-card-summary">{note.summary}</p>
                          
                          {/* Tags Section */}
                          <div className="note-tags">
                            {note.tags?.map(tag => (
                              <span key={tag} className="tag">
                                #{tag}
                                <button
                                  className="tag-remove"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveTag(note.id, tag);
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            {editingNoteId === note.id ? (
                              <div className="tag-input-container" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  className="tag-input"
                                  placeholder="Add tag..."
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddTag(note.id, newTag);
                                    } else if (e.key === 'Escape') {
                                      setEditingNoteId(null);
                                      setNewTag('');
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  className="tag-add-btn"
                                  onClick={() => handleAddTag(note.id, newTag)}
                                >
                                  Add
                                </button>
                              </div>
                            ) : (
                              <button
                                className="tag-add-icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingNoteId(note.id);
                                }}
                              >
                                + Tag
                              </button>
                            )}
                          </div>
                          
                          <div className="note-card-footer">
                            <span className="note-date">
                              {new Date(note.timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <a
                              href={note.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="note-url"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Source →
                            </a>
                          </div>
                          {note.relatedNotes && (
                            <div className="related-notes">
                              <h4>Related Notes:</h4>
                              <div className="related-notes-list">
                                {note.relatedNotes.map(id => {
                                  const relatedNote = notes.find(n => n.id === id);
                                  return relatedNote ? (
                                    <span key={id} className="related-note-tag">
                                      {relatedNote.title}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Note Detail Modal */}
            {selectedNote && (
              <div className="modal-overlay" onClick={() => setSelectedNote(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>{selectedNote.title}</h2>
                    <button
                      className="close-btn"
                      onClick={() => setSelectedNote(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="detail-section">
                      <h4>AI Summary</h4>
                      <p>{selectedNote.summary}</p>
                    </div>
                    <div className="detail-section">
                      <h4>Original Text</h4>
                      <p className="original-text">{selectedNote.content}</p>
                    </div>
                    <div className="detail-section">
                      <h4>Source</h4>
                      <a
                        href={selectedNote.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-link"
                      >
                        {selectedNote.url}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'mindmap' ? (
          <div className="mindmap-view">
            <MindMap 
              notes={notes}
              onNoteClick={(noteId) => {
                const note = notes.find(n => n.id === noteId);
                if (note) {
                  setSelectedNote(note);
                  // 在 mindmap 视图中也能查看笔记，无需切换
                }
              }}
            />
            
            {/* Note Detail Modal - 在 mindmap 中也显示 */}
            {selectedNote && viewMode === 'mindmap' && (
              <div className="modal-overlay" onClick={() => setSelectedNote(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>{selectedNote.title}</h2>
                    <button
                      className="close-btn"
                      onClick={() => setSelectedNote(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="detail-section">
                      <h4>AI Summary</h4>
                      <p>{selectedNote.summary}</p>
                    </div>
                    <div className="detail-section">
                      <h4>Original Text</h4>
                      <p className="original-text">{selectedNote.content}</p>
                    </div>
                    <div className="detail-section">
                      <h4>Source</h4>
                      <a
                        href={selectedNote.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-link"
                      >
                        {selectedNote.url}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="statistics-view">
            <Statistics notes={notes} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SidePanel;

