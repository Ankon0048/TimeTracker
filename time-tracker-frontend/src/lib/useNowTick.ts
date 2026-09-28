"use client";

import { useEffect, useState } from "react";

// Forces consuming components to re-render every `intervalMs` so live
// timers (computed from a stored start timestamp) visibly tick.
export function useNowTick(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return now;
}
