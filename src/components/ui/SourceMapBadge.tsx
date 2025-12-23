import { Check } from "lucide-react";

interface SourceMapBadgeProps {
  detected: boolean;
  externalUrl: string | null;
}

export function SourceMapBadge({ detected, externalUrl }: SourceMapBadgeProps) {
  if (!detected && !externalUrl) {
    return null;
  }

  return (
    <>
      {detected && (
        <span className="flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
          <Check className="h-3 w-3" />
          Source Map
        </span>
      )}
      {externalUrl && (
        <span
          className="max-w-48 truncate rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400"
          title={`External source map: ${externalUrl}`}
        >
          External: {externalUrl}
        </span>
      )}
    </>
  );
}
