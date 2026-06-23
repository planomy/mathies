import { useEffect, useState } from 'react';
import type { YearLevel } from '../types';

const STORAGE_KEY = 'mathies-year-level';
const DEFAULT_YEAR: YearLevel = 'y5';

function isYearLevel(value: string | null): value is YearLevel {
  return value === 'y4' || value === 'y5' || value === 'y6';
}

export function useYearLevel() {
  const [yearLevel, setYearLevel] = useState<YearLevel>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isYearLevel(stored) ? stored : DEFAULT_YEAR;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, yearLevel);
  }, [yearLevel]);

  return { yearLevel, setYearLevel };
}
