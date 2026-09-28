"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { RunningTasksPanel } from "@/components/RunningTasksPanel";

export function AppHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        borderBottom: "1px solid var(--border-color)",
        backgroundColor: "var(--bg-secondary)",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "1.125rem 2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/projects"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
        >
          <Clock size={24} style={{ color: "var(--accent-color)" }} />
          <span style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            TimeTracker
          </span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link
            href="/projects"
            style={{
              fontSize: "0.9375rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.375rem",
              transition: "color 0.15s ease",
            }}
          >
            Projects
          </Link>
          <RunningTasksPanel />
        </nav>
      </div>
    </header>
  );
}
