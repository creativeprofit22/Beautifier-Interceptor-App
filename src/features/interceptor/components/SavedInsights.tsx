"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Shield,
  FileCode,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Insight {
  id: string;
  sessionId: string;
  type: "scan" | "openapi" | "patterns";
  data: Record<string, unknown>;
  createdAt: string;
}

type SavedInsightsProps = Record<string, never>;

const TYPE_CONFIG = {
  scan: {
    icon: Shield,
    label: "Security Scan",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  openapi: {
    icon: FileCode,
    label: "OpenAPI Spec",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
  },
  patterns: {
    icon: Database,
    label: "Patterns",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
} as const;

function InsightCard({
  insight,
  onDelete,
  isDeleting,
}: {
  insight: Insight;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = TYPE_CONFIG[insight.type];
  const Icon = config.icon;

  const createdDate = new Date(insight.createdAt);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(createdDate);

  // Extract summary info based on type
  const getSummary = () => {
    const data = insight.data;
    if (insight.type === "scan") {
      const summary = data.summary as Record<string, number> | undefined;
      if (summary) {
        return `${summary.total || 0} findings (${summary.critical || 0} critical, ${summary.high || 0} high)`;
      }
    }
    if (insight.type === "openapi") {
      return "OpenAPI specification";
    }
    return null;
  };

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-500" />
          )}
          <Icon className={`h-5 w-5 ${config.color}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-200">
                {config.label}
              </span>
              <span className="text-xs text-zinc-500">
                Session: {insight.sessionId}
              </span>
            </div>
            {(() => {
              const summary = getSummary();
              return summary && (
                <p className="text-xs text-zinc-400 mt-0.5">{summary}</p>
              );
            })()}
          </div>
          <span className="text-xs text-zinc-500">{formattedDate}</span>
        </button>
        <button
          onClick={() => onDelete(insight.id)}
          disabled={isDeleting}
          className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-400 disabled:opacity-50"
          title="Delete"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-zinc-800 p-4">
          <pre className="max-h-96 overflow-auto rounded bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
            {JSON.stringify(insight.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function SavedInsights(_props: SavedInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "scan" | "openapi" | "patterns">("all");
  const { showToast } = useToast();

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const url = filter === "all"
        ? "/api/interceptor/insights"
        : `/api/interceptor/insights?type=${filter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load insights", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [filter]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/interceptor/insights/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      setInsights((prev) => prev.filter((i) => i.id !== id));
      showToast("Insight deleted", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-violet-500" />
          <span className="text-sm font-medium text-zinc-200">Saved Insights</span>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {insights.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-100 focus:border-violet-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="scan">Security Scans</option>
            <option value="openapi">OpenAPI Specs</option>
            <option value="patterns">Patterns</option>
          </select>
          <button
            onClick={fetchInsights}
            disabled={isLoading}
            className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
        </div>
      ) : insights.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900">
          <AlertCircle className="h-8 w-8 text-zinc-600" />
          <span className="text-sm text-zinc-500">No saved insights</span>
          <span className="text-xs text-zinc-600">
            Save scan results or OpenAPI specs to view them here
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDelete={handleDelete}
              isDeleting={deletingId === insight.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
