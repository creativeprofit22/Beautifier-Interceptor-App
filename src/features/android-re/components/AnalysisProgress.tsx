"use client";

import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

export type AnalysisStage =
  | "idle"
  | "uploading"
  | "decompiling"
  | "analyzing"
  | "complete"
  | "error";

interface AnalysisProgressProps {
  stage: AnalysisStage;
  progress?: number;
  message?: string;
  error?: string;
}

const stageConfig: Record<AnalysisStage, { label: string; color: string }> = {
  idle: { label: "Ready", color: "text-zinc-500" },
  uploading: { label: "Uploading APK", color: "text-blue-400" },
  decompiling: { label: "Decompiling with JADX", color: "text-violet-400" },
  analyzing: { label: "Analyzing with Ghidra", color: "text-amber-400" },
  complete: { label: "Analysis Complete", color: "text-green-400" },
  error: { label: "Error", color: "text-red-400" },
};

export function AnalysisProgress({ stage, progress, message, error }: AnalysisProgressProps) {
  const config = stageConfig[stage];
  const isActive = stage !== "idle" && stage !== "complete" && stage !== "error";

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center gap-3">
        <div className={config.color}>
          {stage === "complete" ? (
            <CheckCircle className="h-5 w-5" />
          ) : stage === "error" ? (
            <XCircle className="h-5 w-5" />
          ) : isActive ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Clock className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
          {message && <p className="mt-0.5 text-xs text-zinc-500">{message}</p>}
          {error && <p className="mt-0.5 text-xs text-red-400">{error}</p>}
        </div>
        {progress !== undefined && isActive && (
          <span className="font-mono text-sm text-zinc-400">{progress}%</span>
        )}
      </div>

      {progress !== undefined && isActive && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
