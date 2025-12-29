import { LucideIcon, Radio, FileSearch, AlertTriangle, Database } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon = Database, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-zinc-800/50 p-4">
        <Icon className="h-8 w-8 text-zinc-500" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-zinc-300">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-zinc-500">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Pre-configured empty states for Interceptor
export function NoSessionsEmpty() {
  return (
    <EmptyState
      icon={Radio}
      title="No capture sessions"
      description="Start capturing traffic using the CLI to see sessions here. Run 'interceptor capture --mode passive' to begin."
    />
  );
}

export function NoTrafficEmpty() {
  return (
    <EmptyState
      icon={FileSearch}
      title="No traffic captured"
      description="This session hasn't captured any HTTP traffic yet. Make some requests through the proxy to see them here."
    />
  );
}

export function NoScanResultsEmpty() {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="No vulnerabilities found"
      description="The security scan completed without finding any issues. This is good news!"
    />
  );
}
