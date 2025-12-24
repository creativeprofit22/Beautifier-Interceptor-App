"use client";

import { ArrowLeft, Radio, Pause, Circle, Activity, Clock, Layers } from "lucide-react";
import { TrafficEntry, TrafficEntryData } from "./TrafficEntry";
import { Session, SessionStatus, SessionMode } from "./SessionList";

interface SessionStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
}

interface SessionDetailProps {
  session: Session;
  stats: SessionStats;
  trafficEntries: TrafficEntryData[];
  onBack: () => void;
}

function StatusBadge({ status }: { status: SessionStatus }) {
  const config = {
    active: {
      icon: Radio,
      text: "Active",
      className: "border-green-500/30 bg-green-500/10 text-green-400",
    },
    paused: {
      icon: Pause,
      text: "Paused",
      className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    },
    completed: {
      icon: Circle,
      text: "Completed",
      className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
    },
  };

  const { icon: Icon, text, className } = config[status];

  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

function ModeBadge({ mode }: { mode: SessionMode }) {
  const config = {
    passive: {
      text: "Passive Mode",
      className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
    },
    intercept: {
      text: "Intercept Mode",
      className: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    },
    modify: {
      text: "Modify Mode",
      className: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    },
  };

  const { text, className } = config[mode];

  return (
    <span className={`rounded-full border px-3 py-1 text-sm font-medium ${className}`}>{text}</span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium tracking-wider uppercase">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-zinc-100">{value}</div>
      {subValue && <div className="mt-1 text-xs text-zinc-500">{subValue}</div>}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function SessionDetail({ session, stats, trafficEntries, onBack }: SessionDetailProps) {
  const successRate =
    stats.totalRequests > 0
      ? Math.round((stats.successfulRequests / stats.totalRequests) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-lg font-semibold text-zinc-100">
              Session {session.id.slice(0, 8)}
            </h2>
            <StatusBadge status={session.status} />
            <ModeBadge mode={session.mode} />
          </div>
          <p className="mt-1 text-sm text-zinc-500">Started {formatDate(session.startedAt)}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Layers} label="Total Requests" value={stats.totalRequests} />
        <StatCard
          icon={Activity}
          label="Success Rate"
          value={`${successRate}%`}
          subValue={`${stats.successfulRequests} successful, ${stats.failedRequests} failed`}
        />
        <StatCard icon={Clock} label="Avg Response" value={`${stats.averageResponseTime}ms`} />
        <StatCard
          icon={Radio}
          label="Status"
          value={session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        />
      </div>

      {/* Traffic List */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-zinc-400">Traffic Entries</h3>
        {trafficEntries.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
            <span className="text-sm text-zinc-600">No traffic captured yet</span>
          </div>
        ) : (
          <div className="flex max-h-[calc(100vh-400px)] flex-col gap-2 overflow-auto">
            {trafficEntries.map((entry) => (
              <TrafficEntry key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
