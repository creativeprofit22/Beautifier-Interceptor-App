"use client";

import { Shield, Download, Save } from "lucide-react";
import { downloadAsJson } from "@/lib/download";
import { useSaveInsight } from "../hooks/useSaveInsight";
import { ActionButton } from "@/components/ui/ActionButton";
import { Finding } from "./FindingCard";
import { SeverityGroup } from "./SeverityGroup";

// Re-export types for backwards compatibility
export type { SeverityLevel, Finding } from "./FindingCard";

interface ScanResultsProps {
  findings: Finding[];
  sessionId?: string;
  scanTime?: Date;
  duration?: number;
}

interface ScanReport {
  generatedAt: string;
  scanTime?: string;
  duration?: number;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  findings: Finding[];
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function buildScanReport(
  findings: Finding[],
  scanTime?: Date,
  duration?: number
): ScanReport {
  return {
    generatedAt: new Date().toISOString(),
    scanTime: scanTime?.toISOString(),
    duration,
    summary: {
      total: findings.length,
      critical: findings.filter((f) => f.severity === "CRITICAL").length,
      high: findings.filter((f) => f.severity === "HIGH").length,
      medium: findings.filter((f) => f.severity === "MEDIUM").length,
      low: findings.filter((f) => f.severity === "LOW").length,
    },
    findings,
  };
}

export function ScanResults({ findings, sessionId, scanTime, duration }: ScanResultsProps) {
  const { isSaving, saveInsight } = useSaveInsight({
    type: "scan",
    successMessage: "Scan results saved",
  });

  const criticalFindings = findings.filter((f) => f.severity === "CRITICAL");
  const highFindings = findings.filter((f) => f.severity === "HIGH");
  const mediumFindings = findings.filter((f) => f.severity === "MEDIUM");
  const lowFindings = findings.filter((f) => f.severity === "LOW");

  const hasFindings = findings.length > 0;

  const handleExport = () => {
    const report = buildScanReport(findings, scanTime, duration);
    downloadAsJson(report, `security-scan-${new Date().toISOString().split("T")[0]}.json`);
  };

  const handleSave = () => {
    saveInsight(sessionId, buildScanReport(findings, scanTime, duration));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-violet-500" />
          <span className="text-sm font-medium text-zinc-200">Security Scan Results</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          {scanTime && (
            <span>
              Scanned{" "}
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(scanTime)}
            </span>
          )}
          {duration !== undefined && <span>{formatDuration(duration)}</span>}
          <span className={`font-medium ${hasFindings ? "text-yellow-400" : "text-green-400"}`}>
            {findings.length} {findings.length === 1 ? "issue" : "issues"} found
          </span>
          {sessionId && (
            <ActionButton
              onClick={handleSave}
              disabled={isSaving}
              icon={<Save className="h-3.5 w-3.5" />}
              label="Save"
              isLoading={isSaving}
              loadingLabel="Saving..."
            />
          )}
          <ActionButton
            onClick={handleExport}
            icon={<Download className="h-3.5 w-3.5" />}
            label="Export"
          />
        </div>
      </div>

      {/* Results */}
      {!hasFindings ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5">
          <Shield className="h-8 w-8 text-green-500" />
          <span className="text-sm font-medium text-green-400">No security issues found</span>
          <span className="text-xs text-zinc-500">Your application passed all security checks</span>
        </div>
      ) : (
        <div className="space-y-3">
          <SeverityGroup severity="CRITICAL" findings={criticalFindings} defaultExpanded={true} />
          <SeverityGroup
            severity="HIGH"
            findings={highFindings}
            defaultExpanded={criticalFindings.length === 0}
          />
          <SeverityGroup severity="MEDIUM" findings={mediumFindings} />
          <SeverityGroup severity="LOW" findings={lowFindings} />
        </div>
      )}
    </div>
  );
}
