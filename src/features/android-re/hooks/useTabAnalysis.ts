"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AnalysisStage } from "../components/AnalysisProgress";

interface UseTabAnalysisOptions<TResult> {
  /** API endpoint to POST the file to */
  endpoint: string;
  /** Extract result data from API response */
  extractResult: (data: Record<string, unknown>) => TResult;
  /** Optional: Additional form data fields */
  additionalFields?: Record<string, string>;
}

interface UseTabAnalysisReturn<TResult> {
  /** Currently selected file */
  file: File | null;
  /** Current analysis stage */
  stage: AnalysisStage;
  /** Error message if stage is 'error' */
  error: string | undefined;
  /** Analysis result data */
  result: TResult | null;
  /** Whether analysis is currently in progress */
  isProcessing: boolean;
  /** Handle file selection */
  handleFileSelect: (file: File) => void;
  /** Clear selected file and reset state */
  handleFileClear: () => void;
  /** Start the analysis process */
  handleAnalyze: () => Promise<void>;
}

/**
 * Custom hook for managing tab analysis state.
 * Eliminates repetitive state patterns across decompile/native/strings tabs.
 */
export function useTabAnalysis<TResult>({
  endpoint,
  extractResult,
  additionalFields,
}: UseTabAnalysisOptions<TResult>): UseTabAnalysisReturn<TResult> {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState<TResult | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const resetResults = useCallback(() => {
    setStage("idle");
    setError(undefined);
    setResult(null);
  }, []);

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      setFile(selectedFile);
      resetResults();
    },
    [resetResults]
  );

  const handleFileClear = useCallback(() => {
    setFile(null);
    resetResults();
  }, [resetResults]);

  const handleAnalyze = useCallback(async () => {
    if (!file || stage !== "idle") return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      setStage("uploading");
      setError(undefined);

      const formData = new FormData();
      formData.append("file", file);

      // Add any additional fields
      if (additionalFields) {
        Object.entries(additionalFields).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        signal: abortRef.current.signal,
      });

      setStage("analyzing");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(extractResult(data));
      setStage("complete");
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStage("error");
    }
  }, [file, stage, endpoint, extractResult, additionalFields]);

  const isProcessing = stage !== "idle" && stage !== "complete" && stage !== "error";

  return {
    file,
    stage,
    error,
    result,
    isProcessing,
    handleFileSelect,
    handleFileClear,
    handleAnalyze,
  };
}
