"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface TrafficEntryData {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
  path: string;
  statusCode: number;
  timestamp: Date;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  duration: number;
}

interface TrafficEntryProps {
  entry: TrafficEntryData;
}

function MethodBadge({ method }: { method: TrafficEntryData["method"] }) {
  const config: Record<TrafficEntryData["method"], { bg: string; text: string }> = {
    GET: { bg: "bg-green-500/10", text: "text-green-400" },
    POST: { bg: "bg-blue-500/10", text: "text-blue-400" },
    PUT: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
    PATCH: { bg: "bg-orange-500/10", text: "text-orange-400" },
    DELETE: { bg: "bg-red-500/10", text: "text-red-400" },
    OPTIONS: { bg: "bg-zinc-500/10", text: "text-zinc-400" },
    HEAD: { bg: "bg-zinc-500/10", text: "text-zinc-400" },
  };

  const { bg, text } = config[method];

  return (
    <span className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${bg} ${text}`}>
      {method}
    </span>
  );
}

function StatusCodeBadge({ code }: { code: number }) {
  let colorClass = "text-zinc-400";

  if (code >= 200 && code < 300) {
    colorClass = "text-green-400";
  } else if (code >= 300 && code < 400) {
    colorClass = "text-blue-400";
  } else if (code >= 400 && code < 500) {
    colorClass = "text-yellow-400";
  } else if (code >= 500) {
    colorClass = "text-red-400";
  }

  return <span className={`font-mono text-sm font-medium ${colorClass}`}>{code}</span>;
}

function HeadersTable({ headers }: { headers: Record<string, string> }) {
  const entries = Object.entries(headers);

  if (entries.length === 0) {
    return <span className="text-sm text-zinc-600">No headers</span>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <tbody className="divide-y divide-zinc-800">
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td className="py-1.5 pr-4 font-mono text-xs font-medium whitespace-nowrap text-violet-400">
                {key}
              </td>
              <td className="py-1.5 font-mono text-xs break-all text-zinc-400">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BodyPreview({ body, label }: { body?: string; label: string }) {
  if (!body) {
    return <span className="text-sm text-zinc-600">No {label.toLowerCase()}</span>;
  }

  return (
    <pre className="overflow-auto rounded-lg bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
      {body}
    </pre>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function TrafficEntry({ entry }: TrafficEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "requestHeaders" | "responseHeaders" | "requestBody" | "responseBody"
  >("requestHeaders");

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
      {/* Header Row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-800/30"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
        )}
        <MethodBadge method={entry.method} />
        <span className="flex-1 truncate font-mono text-sm text-zinc-200">{entry.path}</span>
        <StatusCodeBadge code={entry.statusCode} />
        <span className="text-xs text-zinc-500">{entry.duration}ms</span>
        <span className="text-xs text-zinc-600">{formatTime(entry.timestamp)}</span>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-zinc-800">
          {/* Section Tabs */}
          <div className="flex border-b border-zinc-800 bg-zinc-900/50">
            {(
              [
                { key: "requestHeaders", label: "Request Headers" },
                { key: "responseHeaders", label: "Response Headers" },
                { key: "requestBody", label: "Request Body" },
                { key: "responseBody", label: "Response Body" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`px-4 py-2 text-xs font-medium transition-colors ${
                  activeSection === key
                    ? "border-b-2 border-violet-500 text-violet-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="max-h-64 overflow-auto p-4">
            {activeSection === "requestHeaders" && <HeadersTable headers={entry.requestHeaders} />}
            {activeSection === "responseHeaders" && (
              <HeadersTable headers={entry.responseHeaders} />
            )}
            {activeSection === "requestBody" && (
              <BodyPreview body={entry.requestBody} label="Request body" />
            )}
            {activeSection === "responseBody" && (
              <BodyPreview body={entry.responseBody} label="Response body" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
