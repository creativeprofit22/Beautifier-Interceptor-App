import { X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400">
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-4 rounded p-1 transition-colors hover:bg-red-500/20"
        aria-label="Dismiss error"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
