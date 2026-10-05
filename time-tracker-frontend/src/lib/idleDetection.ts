// System-wide idle detection via the Idle Detection API (Chrome / Edge),
// plus desktop-notification permission. Browsers without IdleDetector fall
// back to watching activity inside the page (see TimerBackgroundEffects).

export const IDLE_THRESHOLD_MS = 10 * 60 * 1000;

// The Idle Detection API isn't in TypeScript's DOM lib yet.
export interface IdleDetectorLike extends EventTarget {
  readonly userState: "active" | "idle" | null;
  readonly screenState: "locked" | "unlocked" | null;
  start(options: { threshold: number; signal?: AbortSignal }): Promise<void>;
}

interface IdleDetectorConstructor {
  new (): IdleDetectorLike;
  requestPermission(): Promise<"granted" | "denied">;
}

export function getIdleDetector(): IdleDetectorConstructor | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { IdleDetector?: IdleDetectorConstructor }).IdleDetector ?? null;
}

const permissionListeners = new Set<() => void>();

/** Called when idle-detection permission is newly granted. */
export function onIdlePermissionGranted(listener: () => void): () => void {
  permissionListeners.add(listener);
  return () => permissionListeners.delete(listener);
}

/**
 * Asks for idle-detection and notification permission. Both prompts need a
 * user gesture, so call this synchronously from a click handler (e.g. when a
 * timer starts). Browsers only prompt once; later calls are no-ops.
 */
export function requestIdleTrackingPermissions() {
  if (typeof window === "undefined") return;

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }

  const IdleDetector = getIdleDetector();
  if (IdleDetector) {
    IdleDetector.requestPermission()
      .then((state) => {
        if (state === "granted") permissionListeners.forEach((l) => l());
      })
      .catch(() => {});
  }
}

/** Shows an OS-level notification; returns false if that isn't allowed. */
export function showDesktopNotification(title: string, body: string): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  try {
    const notification = new Notification(title, {
      body,
      // Same tag across tabs, so several open tabs show one notification.
      tag: "timetracker-idle",
      requireInteraction: true,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return true;
  } catch {
    return false;
  }
}
