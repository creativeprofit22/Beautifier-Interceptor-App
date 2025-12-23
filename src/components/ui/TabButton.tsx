interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        isActive
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}
