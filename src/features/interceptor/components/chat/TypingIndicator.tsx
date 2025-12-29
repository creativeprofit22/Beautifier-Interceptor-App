"use client";

interface TypingIndicatorProps {
  accentColor?: string;
}

export function TypingIndicator({ accentColor = "#6366f1" }: TypingIndicatorProps) {
  return (
    <div className="rag-typing-indicator">
      <div className="rag-typing-dots">
        <div
          className="rag-typing-dot"
          style={{
            backgroundColor: accentColor,
            animationDelay: "0ms",
          }}
        />
        <div
          className="rag-typing-dot"
          style={{
            backgroundColor: accentColor,
            animationDelay: "150ms",
          }}
        />
        <div
          className="rag-typing-dot"
          style={{
            backgroundColor: accentColor,
            animationDelay: "300ms",
          }}
        />
      </div>
    </div>
  );
}
