'use client';

import type { ChatMessage } from './types';

interface MessageBubbleProps {
  message: ChatMessage;
  accentColor?: string;
}

export function MessageBubble({
  message,
  accentColor = '#6366f1',
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const time = message.timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`rag-message ${isUser ? 'rag-message-user' : 'rag-message-assistant'}`}>
      <div className={`rag-message-content ${isUser ? 'rag-message-content-user' : 'rag-message-content-assistant'}`}>
        {/* Message bubble */}
        <div
          className={`rag-message-bubble ${isUser ? 'rag-message-bubble-user' : 'rag-message-bubble-assistant'}`}
          style={
            isUser
              ? {
                  boxShadow: `0 0 20px ${accentColor}15`,
                  borderColor: `${accentColor}20`,
                }
              : undefined
          }
        >
          {message.isLoading ? (
            <div className="rag-message-loading">
              <div className="rag-loading-dots">
                <span style={{ backgroundColor: accentColor }} />
                <span style={{ backgroundColor: accentColor }} />
                <span style={{ backgroundColor: accentColor }} />
              </div>
            </div>
          ) : (
            <p className="rag-message-text">{message.content}</p>
          )}
        </div>

        {/* Timestamp */}
        <span className="rag-message-time">{time}</span>
      </div>
    </div>
  );
}
