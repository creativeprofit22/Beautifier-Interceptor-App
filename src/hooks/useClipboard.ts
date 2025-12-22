"use client";

import { useState, useCallback } from "react";

const FEEDBACK_DURATION_MS = 2000;

interface UseClipboardOptions {
  feedbackDuration?: number;
  onError?: (error: string) => void;
}

interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { feedbackDuration = FEEDBACK_DURATION_MS, onError } = options;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (!navigator.clipboard) {
        onError?.("Clipboard not available (requires HTTPS or localhost)");
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), feedbackDuration);
      } catch {
        onError?.("Failed to copy to clipboard");
      }
    },
    [feedbackDuration, onError]
  );

  return { copied, copy };
}
