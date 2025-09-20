import React from 'react';

const ChatPanel = ({ messages, onSelectVisualization }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-panel">
      {messages.length === 0 ? (
        <div className="empty-chat">
          <p>Ask a question about any concept to get an explanation with visualization!</p>
          <p className="empty-chat-examples">Try: "Explain gravity" or "How does photosynthesis work?"</p>
        </div>
      ) : (
        messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.isUser ? 'user-message' : 'bot-message'} ${message.isLoading ? 'loading' : ''}`}
          >
            <p className="message-text">{message.text}</p>
            
            {!message.isUser && message.animationDescription && (
              <p className="animation-description">
                <strong>Animation:</strong> {message.animationDescription}
              </p>
            )}
            
            {message.error && (
              <div className="error-note">
                There was a problem processing this request. Please try again.
              </div>
            )}
            
            <div className="message-meta">
              <span className="message-time">{formatTime(message.timestamp)}</span>
              
              {!message.isUser && message.visualization && (
                <span 
                  className="message-visualization-link"
                  onClick={() => onSelectVisualization(message.visualization, message)}
                >
                  View Visualization
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatPanel;
