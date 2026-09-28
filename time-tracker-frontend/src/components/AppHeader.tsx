"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { RunningTasksPanel } from "@/components/RunningTasksPanel";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface px-10 py-5 shadow-sm">
      <Link href="/projects" className="flex items-center gap-2 text-foreground">
        <Clock size={20} className="text-accent" />
        <span className="text-lg font-bold">TimeTracker</span>
      </Link>
      <nav className="flex items-center gap-6">
        <Link href="/projects" className="text-sm font-medium text-muted hover:text-foreground">
          Projects
        </Link>
        <RunningTasksPanel />
      </nav>
    </header>
  );
}
