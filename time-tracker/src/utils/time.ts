/**
 * Converts a "HH:MM:SS" string to total seconds.
 */
export const timeStringToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 3) return 0;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
};

/**
 * Converts total seconds to "HH:MM:SS" string.
 */
export const secondsToTimeString = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

/**
 * Formats seconds into "MM:SS" for the stopwatch.
 */
export const formatStopwatch = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
