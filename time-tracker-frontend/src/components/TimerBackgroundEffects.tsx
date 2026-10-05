"use client";

import { useEffect } from "react";
import { List, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useAppDispatch, useAppStore } from "@/lib/hooks";
import { hydrateTimers, pauseAllTimers, resumeTimer } from "@/features/timers/timersSlice";
import { loadTimers, saveTimers, TIMERS_STORAGE_KEY } from "@/lib/timerPersistence";
import {
  getIdleDetector,
  IDLE_THRESHOLD_MS,
  onIdlePermissionGranted,
  showDesktopNotification,
} from "@/lib/idleDetection";

const IDLE_MODAL_ID = "idle-paused-timers";
const PAGE_ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "wheel", "touchstart", "scroll"];

/**
 * App-wide timer side effects with no UI of their own:
 * - keeps running timers in localStorage so they survive reloads and stay in
 *   sync across tabs;
 * - pauses ticking timers after IDLE_THRESHOLD_MS without user activity and
 *   tells the user (desktop notification + in-app popup).
 */
export function TimerBackgroundEffects() {
  const store = useAppStore();
  const dispatch = useAppDispatch();

  // Persistence. Hydrating after mount (not in the store's initial state)
  // keeps the server render and first client render identical.
  useEffect(() => {
    dispatch(hydrateTimers(loadTimers()));
    let last = store.getState().timers.running;

    const unsubscribe = store.subscribe(() => {
      const next = store.getState().timers.running;
      if (next === last) return;
      last = next;
      saveTimers(next);
    });

    // Another tab changed its timers: adopt them without writing them back.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== TIMERS_STORAGE_KEY) return;
      dispatch(hydrateTimers(loadTimers()));
      last = store.getState().timers.running;
    };
    window.addEventListener("storage", onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [store, dispatch]);

  // Idle detection.
  useEffect(() => {
    // `idleSince` is when activity stopped; the pause is backdated to it.
    const handleIdle = (idleSince: number) => {
      const ticking = Object.values(store.getState().timers.running).filter(
        (t) => t.startedAt !== null
      );
      if (ticking.length === 0) return;

      dispatch(pauseAllTimers({ at: idleSince }));

      const names = ticking.map((t) => t.taskName);
      const minutes = Math.round(IDLE_THRESHOLD_MS / 60000);
      showDesktopNotification(
        "TimeTracker: timers paused",
        `No activity for ${minutes} minutes. Paused: ${names.join(", ")}`
      );

      modals.close(IDLE_MODAL_ID);
      modals.openConfirmModal({
        modalId: IDLE_MODAL_ID,
        title: "Timers paused due to inactivity",
        centered: true,
        children: (
          <>
            <Text size="sm" mb="xs">
              No mouse or keyboard activity was detected for {minutes} minutes, so these timers
              were paused (the idle time was not counted):
            </Text>
            <List size="sm">
              {names.map((name, i) => (
                <List.Item key={ticking[i].taskId}>{name}</List.Item>
              ))}
            </List>
          </>
        ),
        labels: { confirm: "Resume timers", cancel: "Keep paused" },
        onConfirm: () => {
          const running = store.getState().timers.running;
          for (const t of ticking) {
            if (running[t.taskId]?.startedAt === null) dispatch(resumeTimer(t.taskId));
          }
        },
      });
    };

    // Fallback: activity inside this page only. Replaced by the system-wide
    // IdleDetector once it is available and permitted.
    let lastActivity = Date.now();
    let firedForThisIdle = false;
    const markActive = () => {
      lastActivity = Date.now();
      firedForThisIdle = false;
    };
    const checkPageIdle = () => {
      if (!firedForThisIdle && Date.now() - lastActivity >= IDLE_THRESHOLD_MS) {
        firedForThisIdle = true;
        handleIdle(lastActivity);
      }
    };
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    const startFallback = () => {
      if (fallbackInterval) return;
      PAGE_ACTIVITY_EVENTS.forEach((ev) =>
        window.addEventListener(ev, markActive, { passive: true })
      );
      fallbackInterval = setInterval(checkPageIdle, 15_000);
    };
    const stopFallback = () => {
      PAGE_ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, markActive));
      if (fallbackInterval) clearInterval(fallbackInterval);
      fallbackInterval = null;
    };

    const abort = new AbortController();
    let detectorRunning = false;
    const startSystemDetector = async () => {
      const IdleDetector = getIdleDetector();
      if (!IdleDetector || detectorRunning) return;
      try {
        const detector = new IdleDetector();
        detector.addEventListener("change", () => {
          if (detector.userState === "idle") handleIdle(Date.now() - IDLE_THRESHOLD_MS);
        });
        // Rejects until the user has granted idle-detection permission.
        await detector.start({ threshold: IDLE_THRESHOLD_MS, signal: abort.signal });
        detectorRunning = true;
        stopFallback();
      } catch {
        // Not permitted yet; keep the page-level fallback.
      }
    };

    startFallback();
    startSystemDetector();
    const unsubscribePermission = onIdlePermissionGranted(startSystemDetector);

    return () => {
      abort.abort();
      stopFallback();
      unsubscribePermission();
    };
  }, [store, dispatch]);

  return null;
}
