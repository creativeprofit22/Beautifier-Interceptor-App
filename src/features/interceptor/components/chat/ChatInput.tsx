"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";

export interface ChatInputProps {
  placeholder?: string;
  accentColor?: string;
  onSendMessage?: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({
  placeholder = "Ask a question...",
  accentColor = "#6366f1",
  onSendMessage,
  disabled = false,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!inputValue.trim() || !onSendMessage || disabled) return;

    onSendMessage(inputValue.trim());
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasInput = inputValue.trim().length > 0;

  return (
    <div className="rag-chat-input-container">
      <div className="rag-chat-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="rag-chat-input"
          style={{
            boxShadow: hasInput
              ? `0 0 0 1px ${accentColor}40, 0 0 20px ${accentColor}10`
              : undefined,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!hasInput || disabled}
          className="rag-chat-send-button"
          style={{
            backgroundColor: hasInput ? accentColor : undefined,
            boxShadow: hasInput ? `0 4px 14px 0 ${accentColor}40` : undefined,
          }}
          title="Send message"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
