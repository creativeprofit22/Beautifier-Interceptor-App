import { ReactNode } from "react";

interface CodePanelProps {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function CodePanel({ title, headerRight, children }: CodePanelProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <span className="text-sm font-medium text-zinc-400">{title}</span>
        {headerRight}
      </div>
      {children}
    </div>
  );
}
