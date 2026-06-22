import { useEffect, useState } from 'react';

const STORAGE_KEY = 'mathies-font-size';
const MIN = 0.75;
const MAX = 1.75;
const STEP = 0.1;
const DEFAULT = 1;

export function useFontSize() {
  const [scale, setScale] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? Number(stored) : DEFAULT;
    return Number.isFinite(parsed) ? Math.min(MAX, Math.max(MIN, parsed)) : DEFAULT;
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--question-scale', String(scale));
    localStorage.setItem(STORAGE_KEY, String(scale));
  }, [scale]);

  const increase = () => setScale((s) => Math.min(MAX, Math.round((s + STEP) * 10) / 10));
  const decrease = () => setScale((s) => Math.max(MIN, Math.round((s - STEP) * 10) / 10));
  const reset = () => setScale(DEFAULT);

  const label = `${Math.round(scale * 100)}%`;

  return { scale, increase, decrease, reset, label, canIncrease: scale < MAX, canDecrease: scale > MIN };
}
