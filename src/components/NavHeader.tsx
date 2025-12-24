"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Radio } from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavLink({ href, icon, label, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function NavHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center gap-6">
        <nav className="flex items-center gap-2">
          <NavLink
            href="/"
            icon={<Sparkles className="h-4 w-4" />}
            label="Beautifier"
            isActive={pathname === "/"}
          />
          <NavLink
            href="/interceptor"
            icon={<Radio className="h-4 w-4" />}
            label="Interceptor"
            isActive={pathname === "/interceptor"}
          />
        </nav>
      </div>
    </header>
  );
}
