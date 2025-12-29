"use client";

import type { LucideIcon } from "lucide-react";
import { AnalysisProgress, type AnalysisStage } from "./AnalysisProgress";
import { EmptyState } from "@/components/ui/EmptyState";

interface AnalysisTabProps {
  /** The uploader component to render */
  uploader: React.ReactNode;
  /** Action button configuration */
  actionButton: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    disabled?: boolean;
  };
  /** Current analysis stage */
  stage: AnalysisStage;
  /** Progress message to show during analysis */
  progressMessage?: string;
  /** Error message if analysis failed */
  error?: string;
  /** Results viewer to show when complete */
  resultViewer: React.ReactNode;
  /** Empty state configuration */
  emptyState: {
    icon: LucideIcon;
    title: string;
    description: string;
  };
  /** Whether a file is selected */
  hasFile: boolean;
  /** Whether result data exists */
  hasResult: boolean;
}

/**
 * Generic tab component for analysis workflows.
 * Provides consistent structure: uploader -> action -> progress -> results -> empty.
 */
export function AnalysisTab({
  uploader,
  actionButton,
  stage,
  progressMessage,
  error,
  resultViewer,
  emptyState,
  hasFile,
  hasResult,
}: AnalysisTabProps) {
  const Icon = actionButton.icon;

  return (
    <div className="flex flex-col gap-6">
      {/* File Uploader */}
      {uploader}

      {/* Action Button - show when file selected and idle */}
      {hasFile && stage === "idle" && (
        <button
          onClick={actionButton.onClick}
          disabled={actionButton.disabled}
          className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon className="h-4 w-4" />
          <span>{actionButton.label}</span>
        </button>
      )}

      {/* Analysis Progress - show when not idle */}
      {stage !== "idle" && (
        <AnalysisProgress stage={stage} message={progressMessage} error={error} />
      )}

      {/* Results Viewer - show when complete and has result */}
      {stage === "complete" && hasResult && resultViewer}

      {/* Empty State - show when no file selected */}
      {!hasFile && (
        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          description={emptyState.description}
        />
      )}
    </div>
  );
}
