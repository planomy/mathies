export function msToTimeInput(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function parseTimeInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.includes(':')) {
    const [minPart, secPart] = trimmed.split(':');
    const minutes = Number(minPart);
    const seconds = Number(secPart);
    if (Number.isNaN(minutes) || Number.isNaN(seconds) || seconds >= 60) return null;
    return (minutes * 60 + seconds) * 1000;
  }

  const seconds = Number(trimmed);
  if (Number.isNaN(seconds) || seconds < 0) return null;
  return seconds * 1000;
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Accepts seconds only ("56", "56s") or m:ss ("1:30"). */
export function parseSecondsInput(value: string): number | null {
  const trimmed = value.trim().replace(/s$/i, '');
  return parseTimeInput(trimmed);
}

export function secondsToInput(ms: number): string {
  if (ms <= 0) return '';
  return String(Math.round(ms / 1000));
}
