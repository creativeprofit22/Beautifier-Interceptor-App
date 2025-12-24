import { LucideIcon } from "lucide-react";

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  count?: number;
}

export function TabButton({ label, isActive, onClick, icon: Icon, count }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
          : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
            isActive ? "bg-white/20 text-white" : "bg-zinc-700 text-zinc-400"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
