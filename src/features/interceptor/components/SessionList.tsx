"use client";

import { Eye, Trash2, Radio, Pause, Circle } from "lucide-react";
import { NoSessionsEmpty } from "@/components/ui/EmptyState";

export type SessionStatus = "active" | "paused" | "completed";
export type SessionMode = "passive" | "intercept" | "modify";

export interface Session {
  id: string;
  status: SessionStatus;
  requestCount: number;
  mode: SessionMode;
  startedAt: Date;
}

interface SessionListProps {
  sessions: Session[];
  onView: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
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
      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      <Icon className="h-3 w-3" />
      {text}
    </span>
  );
}

function ModeBadge({ mode }: { mode: SessionMode }) {
  const config = {
    passive: {
      text: "Passive",
      className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
    },
    intercept: {
      text: "Intercept",
      className: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    },
    modify: {
      text: "Modify",
      className: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    },
  };

  const { text, className } = config[mode];

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>
      {text}
    </span>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function SessionList({ sessions, onView, onDelete }: SessionListProps) {
  if (sessions.length === 0) {
    return <NoSessionsEmpty />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50">
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase">
              Requests
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase">
              Mode
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase">
              Started
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-zinc-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {sessions.map((session) => (
            <tr key={session.id} className="transition-colors hover:bg-zinc-800/30">
              <td className="px-4 py-3">
                <span className="font-mono text-sm text-zinc-300">{session.id.slice(0, 8)}...</span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={session.status} />
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-zinc-300">{session.requestCount}</span>
              </td>
              <td className="px-4 py-3">
                <ModeBadge mode={session.mode} />
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-zinc-400">{formatDate(session.startedAt)}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onView(session.id)}
                    className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                    aria-label="View session"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(session.id)}
                    className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                    aria-label="Delete session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
