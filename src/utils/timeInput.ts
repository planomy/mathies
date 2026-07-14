export function msToTimeInput(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function parseMinutesAndSeconds(minutesRaw: string, secondsRaw: string): number | null {
  if (!minutesRaw || secondsRaw === '' || !/^\d+$/.test(secondsRaw) || secondsRaw.length > 2) {
    return null;
  }
  const minutes = Number(minutesRaw);
  const seconds = Number(secondsRaw);
  if (Number.isNaN(minutes) || Number.isNaN(seconds) || minutes < 0 || seconds >= 60) {
    return null;
  }
  return (minutes * 60 + seconds) * 1000;
}

export function parseTimeInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.includes(':')) {
    const [minPart, secPart = ''] = trimmed.split(':');
    return parseMinutesAndSeconds(minPart, secPart);
  }

  // Digi-style minutes.seconds — e.g. 3.12 → 3 min 12 sec → 192s
  if (trimmed.includes('.')) {
    const [minPart, secPart = ''] = trimmed.split('.');
    if (trimmed.indexOf('.') !== trimmed.lastIndexOf('.')) return null;
    return parseMinutesAndSeconds(minPart, secPart);
  }

  const seconds = Number(trimmed);
  if (Number.isNaN(seconds) || seconds < 0) return null;
  return seconds * 1000;
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Accepts seconds ("56"), m:ss ("3:12"), or digi m.ss ("3.12"). */
export function parseSecondsInput(value: string): number | null {
  const trimmed = value.trim().replace(/s$/i, '');
  return parseTimeInput(trimmed);
}

/** Normalize a time string to whole seconds for display/storage. */
export function normalizeSecondsInput(value: string): string | null {
  const ms = parseSecondsInput(value);
  if (ms === null || ms <= 0) return null;
  return String(Math.round(ms / 1000));
}

export function secondsToInput(ms: number): string {
  if (ms <= 0) return '';
  return String(Math.round(ms / 1000));
}
