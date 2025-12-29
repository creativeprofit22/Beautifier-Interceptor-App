"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Info,
  ExternalLink,
} from "lucide-react";

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  location: string;
  recommendation: string;
  cweId?: string;
  references?: string[];
}

export const SEVERITY_CONFIG = {
  CRITICAL: {
    Icon: AlertCircle,
    iconClass: "text-red-500",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-400",
    groupBg: "bg-red-500/5",
    groupBorder: "border-red-500/20",
  },
  HIGH: {
    Icon: AlertTriangle,
    iconClass: "text-orange-500",
    badgeClass: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    groupBg: "bg-orange-500/5",
    groupBorder: "border-orange-500/20",
  },
  MEDIUM: {
    Icon: AlertTriangle,
    iconClass: "text-yellow-500",
    badgeClass: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    groupBg: "bg-yellow-500/5",
    groupBorder: "border-yellow-500/20",
  },
  LOW: {
    Icon: Info,
    iconClass: "text-blue-500",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    groupBg: "bg-blue-500/5",
    groupBorder: "border-blue-500/20",
  },
} as const;

export function SeverityIcon({ severity }: { severity: SeverityLevel }) {
  const { Icon, iconClass } = SEVERITY_CONFIG[severity];
  return <Icon className={`h-5 w-5 ${iconClass}`} />;
}

export function SeverityBadge({ severity }: { severity: SeverityLevel }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${SEVERITY_CONFIG[severity].badgeClass}`}
    >
      {severity}
    </span>
  );
}

function getHostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function FindingCard({ finding }: { finding: Finding }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-800/30"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
        )}
        <SeverityIcon severity={finding.severity} />
        <span className="flex-1 text-sm font-medium text-zinc-200">{finding.title}</span>
        <SeverityBadge severity={finding.severity} />
      </button>

      {isExpanded && (
        <div className="border-t border-zinc-800 p-4">
          <div className="space-y-4">
            {/* Description */}
            <div>
              <h4 className="mb-1 text-xs font-medium tracking-wider text-zinc-500 uppercase">
                Description
              </h4>
              <p className="text-sm text-zinc-300">{finding.description}</p>
            </div>

            {/* Location */}
            <div>
              <h4 className="mb-1 text-xs font-medium tracking-wider text-zinc-500 uppercase">
                Location
              </h4>
              <code className="rounded bg-zinc-950 px-2 py-1 font-mono text-xs text-violet-400">
                {finding.location}
              </code>
            </div>

            {/* Recommendation */}
            <div>
              <h4 className="mb-1 text-xs font-medium tracking-wider text-zinc-500 uppercase">
                Recommendation
              </h4>
              <p className="text-sm text-zinc-300">{finding.recommendation}</p>
            </div>

            {/* CWE ID */}
            {finding.cweId && (
              <div>
                <h4 className="mb-1 text-xs font-medium tracking-wider text-zinc-500 uppercase">
                  CWE Reference
                </h4>
                <a
                  href={`https://cwe.mitre.org/data/definitions/${finding.cweId.replace("CWE-", "")}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300"
                >
                  {finding.cweId}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* References */}
            {finding.references && finding.references.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-medium tracking-wider text-zinc-500 uppercase">
                  References
                </h4>
                <ul className="space-y-1">
                  {finding.references.map((ref, index) => (
                    <li key={index}>
                      <a
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300"
                      >
                        {getHostnameFromUrl(ref)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
