"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Finding, SeverityLevel, SEVERITY_CONFIG, SeverityIcon, FindingCard } from "./FindingCard";

interface SeverityGroupProps {
  severity: SeverityLevel;
  findings: Finding[];
  defaultExpanded?: boolean;
}

export function SeverityGroup({ severity, findings, defaultExpanded = false }: SeverityGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (findings.length === 0) return null;

  const { groupBg, groupBorder } = SEVERITY_CONFIG[severity];

  return (
    <div className={`rounded-xl border ${groupBorder} ${groupBg}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-zinc-500" />
        )}
        <SeverityIcon severity={severity} />
        <span className="flex-1 text-sm font-semibold text-zinc-200">{severity}</span>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
          {findings.length} {findings.length === 1 ? "finding" : "findings"}
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-2 p-4 pt-0">
          {findings.map((finding) => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      )}
    </div>
  );
}
