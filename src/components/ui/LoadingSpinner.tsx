import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}
