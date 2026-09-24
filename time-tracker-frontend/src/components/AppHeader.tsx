import Link from "next/link";
import { Clock } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface px-8 py-4 shadow-sm">
      <Link href="/projects" className="flex items-center gap-2 text-foreground">
        <Clock size={20} className="text-accent" />
        <span className="text-lg font-bold">TimeTracker</span>
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/projects" className="text-sm font-medium text-muted hover:text-foreground">
          Projects
        </Link>
      </nav>
    </header>
  );
}
