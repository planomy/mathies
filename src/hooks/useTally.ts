import { useCallback, useEffect, useState } from 'react';
import type { TallyDraft, TallyRecord } from '../types';

const RECORDS_KEY = 'mathies-tally';
const ROSTER_KEY = 'mathies-roster';
const DRAFTS_KEY = 'mathies-tally-drafts';

function loadRecords(): TallyRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? (JSON.parse(raw) as TallyRecord[]) : [];
  } catch {
    return [];
  }
}

function loadRoster(): string[] {
  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function loadDrafts(): Record<string, TallyDraft> {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, TallyDraft>) : {};
  } catch {
    return {};
  }
}

function mergeRoster(roster: string[], records: TallyRecord[]): string[] {
  const names = new Set(roster);
  for (const r of records) names.add(r.studentName);
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function useTally() {
  const [records, setRecords] = useState<TallyRecord[]>(loadRecords);
  const [roster, setRoster] = useState<string[]>(() =>
    mergeRoster(loadRoster(), loadRecords()),
  );
  const [drafts, setDrafts] = useState<Record<string, TallyDraft>>(loadDrafts);

  useEffect(() => {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
  }, [roster]);

  useEffect(() => {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  }, [drafts]);

  const ensureOnRoster = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setRoster((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed].sort()));
  }, []);

  const addRecord = useCallback(
    (studentName: string, timeMs: number, correct: number, total: number) => {
      const trimmed = studentName.trim();
      const record: TallyRecord = {
        id: crypto.randomUUID(),
        studentName: trimmed,
        timeMs,
        correct,
        total,
        recordedAt: new Date().toISOString(),
      };
      setRecords((prev) => [record, ...prev]);
      ensureOnRoster(trimmed);
      return record;
    },
    [ensureOnRoster],
  );

  const removeRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addStudent = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    setRoster((prev) => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed].sort((a, b) => a.localeCompare(b));
    });
    return true;
  }, []);

  const removeStudent = useCallback((name: string) => {
    setRoster((prev) => prev.filter((n) => n !== name));
  }, []);

  const getLatestRecord = useCallback(
    (name: string) => records.find((r) => r.studentName === name),
    [records],
  );

  const updateDraft = useCallback((name: string, patch: Partial<TallyDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [name]: {
        correct: patch.correct ?? prev[name]?.correct ?? '',
        total: patch.total ?? prev[name]?.total ?? '',
        time: patch.time ?? prev[name]?.time ?? '',
      },
    }));
  }, []);

  const setDraft = useCallback((name: string, draft: TallyDraft) => {
    setDrafts((prev) => ({ ...prev, [name]: draft }));
  }, []);

  const clearAll = useCallback(() => {
    setRecords([]);
    setRoster([]);
    setDrafts({});
  }, []);

  return {
    records,
    roster,
    drafts,
    addRecord,
    removeRecord,
    addStudent,
    removeStudent,
    getLatestRecord,
    updateDraft,
    setDraft,
    clearAll,
  };
}
