// Content Script - Listen for page text selection and show summary button

import { MessageType, SummarizeRequest } from '../shared/types';
import './content.css';

// Create floating button
let floatingButton: HTMLDivElement | null = null;

/**
 * Initialize Content Script
 */
function init() {
  console.log('🔵 WebMind Content Script initialization started');
  console.log('🔵 Current page URL:', window.location.href);
  
  // Check if extension context is valid (but still initialize)
  if (!isExtensionContextValid()) {
    console.warn('⚠️ Extension context is invalid, buttons will show but require page refresh');
  }
  
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('selectionchange', handleSelectionChange);
  
  console.log('🔵 WebMind Content Script loaded successfully');
  
  // Test message passing
  chrome.runtime.sendMessage({ type: 'PING' }).then(response => {
    console.log('✅ Communication with Background is normal', response);
  }).catch(error => {
    console.error('❌ Failed to communicate with Background:', error);
    if (error.message && error.message.includes('Extension context invalidated')) {
      console.warn('💡 Extension has been updated, please refresh this page');
    }
  });
}

/**
 * Handle text selection
 */
function handleTextSelection(event: MouseEvent) {
  console.log('📋 Text selection event detected');
  
  // Check if clicked on floating button (ignore clicks on button)
  const target = event.target as HTMLElement;
  if (target && floatingButton && floatingButton.contains(target)) {
    console.log('⏭️ Clicked on floating button, ignoring selection event');
    return;
  }
  
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();
  console.log('📋 Selected text length:', selectedText?.length || 0);

  if (selectedText && selectedText.length > 10) {
    console.log('✅ Text length meets requirement, showing floating button');
    showFloatingButton(event.clientX, event.clientY, selectedText);
  } else {
    console.log('❌ Text too short or not selected, hiding button');
    hideFloatingButton();
  }
}

/**
 * Handle selection change
 */
function handleSelectionChange() {
  const selection = window.getSelection();
  if (!selection || selection.toString().trim().length === 0) {
    hideFloatingButton();
  }
}

/**
 * Show floating button
 */
function showFloatingButton(x: number, y: number, text: string) {
  console.log('🎯 Showing floating button at position:', x, y);
  
  // Remove existing button
  hideFloatingButton();

  // Create new button
  floatingButton = document.createElement('div');
  floatingButton.id = 'webmind-floating-button';
  floatingButton.innerHTML = `
    <button id="webmind-summarize-btn">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L2 6L8 10L14 6L8 2Z" fill="currentColor"/>
        <path d="M2 10L8 14L14 10" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <span>Add to Notes</span>
    </button>
  `;

  // Set styles
  Object.assign(floatingButton.style, {
    position: 'fixed',
    left: `${x}px`,
    top: `${y + 20}px`,
    zIndex: '999999',
    animation: 'webmind-fadein 0.2s ease-out',
  });

  // Add to page
  document.body.appendChild(floatingButton);
  console.log('✅ Floating button added to page');

  // Bind click event
  const button = floatingButton.querySelector('#webmind-summarize-btn');
  if (button) {
    console.log('✅ Button element found, binding click event');
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🎉 Floating button clicked!');
      console.log('📝 Preparing to save text, length:', text.length);
      
      // Clear selection to prevent mouseup event from retriggering
      window.getSelection()?.removeAllRanges();
      
      if (text) {
        handleSummarize(text);
        hideFloatingButton();
      }
    });
  } else {
    console.error('❌ Button element not found!');
  }

  // Close on outside click (use capture phase for priority)
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside, true);
    console.log('👂 Outside click listener added');
  }, 100);
}

/**
 * Hide floating button
 */
function hideFloatingButton() {
  if (floatingButton) {
    floatingButton.remove();
    floatingButton = null;
    document.removeEventListener('click', handleClickOutside, true);
  }
}

/**
 * Handle outside click
 */
function handleClickOutside(event: MouseEvent) {
  if (floatingButton && !floatingButton.contains(event.target as Node)) {
    hideFloatingButton();
  }
}

/**
 * Check if extension context is valid
 */
function isExtensionContextValid(): boolean {
  try {
    // Try to access chrome.runtime, if error thrown, context is invalid
    if (!chrome || !chrome.runtime) {
      return false;
    }
    // Check if extension ID is accessible
    // @ts-ignore - runtime.id exists at runtime but TypeScript definition may be incomplete
    return typeof chrome.runtime.id === 'string';
  } catch (error) {
    return false;
  }
}

/**
 * Handle summarize request
 */
async function handleSummarize(text: string) {
  console.log('💾 Starting to handle summarize request');
  console.log('💾 Text content:', text.substring(0, 100) + '...');
  
  // Check if extension context is valid
  if (!isExtensionContextValid()) {
    console.error('❌ Extension context is invalid, page refresh needed');
    showNotification('Extension has been updated, please refresh the page and retry', 'error');
    return;
  }
  
  if (!text || text.length < 10) {
    console.warn('⚠️ Text too short');
    showNotification('Selected text is too short', 'error');
    return;
  }

  try {
    // Send message to background script
    const request: SummarizeRequest = {
      text,
      url: window.location.href,
      title: document.title,
    };

    console.log('📤 Sending message to background:', request);

    const response = await chrome.runtime.sendMessage({
      type: MessageType.COLLECT_TEXT,
      payload: request,
    });

    console.log('📥 Received response from background:', response);

    if (response.error) {
      console.error('❌ Save error:', response.error);
      showNotification(response.error, 'error');
    } else {
      console.log('✅ Save successful! noteId:', response.noteId);
      showNotification('Added to notes!', 'success');
      hideFloatingButton();
    }
  } catch (error: any) {
    console.error('❌ Save failed:', error);
    
    // Special handling for extension context invalidation error
    if (error.message && error.message.includes('Extension context invalidated')) {
      showNotification('Extension has been updated, please refresh the page and retry 🔄', 'error');
    } else {
      showNotification('Save failed, please retry', 'error');
    }
  }
}

/**
 * Show notification
 */
function showNotification(message: string, type: 'success' | 'error' | 'loading') {
  // Remove existing notification
  const existing = document.getElementById('webmind-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'webmind-notification';
  notification.className = `webmind-notification webmind-notification-${type}`;
  notification.textContent = message;

  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: '1000000',
    animation: 'webmind-slidein 0.3s ease-out',
  });

  document.body.appendChild(notification);

  // Auto remove after 3 seconds (except for loading type)
  if (type !== 'loading') {
    setTimeout(() => {
      notification.style.animation = 'webmind-slideout 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Received message:', message);

  if (message.action === 'addNote') {
    const selection = window.getSelection()?.toString().trim();
    console.log('📝 Selected text:', selection);

    if (selection) {
      handleSummarize(selection);
      sendResponse({ success: true });
    } else {
      showNotification('No text selected', 'error');
      sendResponse({ error: 'No text selected' });
    }
  }

  return true; // Keep message channel open
});

// Initialize
init();


