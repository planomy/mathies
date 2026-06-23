import { useEffect, useMemo, useRef, useState, type Ref } from 'react';
import { ProgressChart } from './ProgressChart';
import { useTally } from '../hooks/useTally';
import type { TallyDraft, TallyRecord } from '../types';
import { DEFAULT_TALLY_DRAFT } from '../types';
import { formatShortDate, parseSecondsInput } from '../utils/timeInput';

interface StudentRowProps {
  name: string;
  correct: string;
  total: string;
  timeInput: string;
  savedToday?: TallyRecord;
  selected: boolean;
  flash: boolean;
  inputRef: Ref<HTMLInputElement>;
  onCorrectChange: (value: string) => void;
  onTotalChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onSelect: (name: string) => void;
  onTimeTab: () => void;
}

function StudentRow({
  name,
  correct,
  total,
  timeInput,
  savedToday,
  selected,
  flash,
  inputRef,
  onCorrectChange,
  onTotalChange,
  onTimeChange,
  onSelect,
  onTimeTab,
}: StudentRowProps) {
  const totalRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  const selectAllOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  const selectAllOnClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      onTimeTab();
    }
  };

  const focusOnEnterOrTab = (
    e: React.KeyboardEvent<HTMLInputElement>,
    next: HTMLInputElement | null | undefined,
  ) => {
    if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      next?.focus();
    }
  };

  return (
    <li className={`tally-entry ${flash ? 'saved' : ''} ${savedToday ? 'logged' : ''}`}>
      <button
        type="button"
        className={`tally-entry-name ${selected ? 'selected' : ''}`}
        tabIndex={-1}
        onClick={() => onSelect(name)}
      >
        {name}
      </button>

      <div className="tally-entry-score">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          className="tally-field"
          value={correct}
          aria-label={`${name} correct`}
          onChange={(e) => onCorrectChange(e.target.value.replace(/\D/g, ''))}
          onFocus={selectAllOnFocus}
          onClick={selectAllOnClick}
          onKeyDown={(e) => focusOnEnterOrTab(e, totalRef.current)}
        />
        <span>/</span>
        <input
          ref={totalRef}
          type="text"
          inputMode="numeric"
          className="tally-field"
          value={total}
          aria-label={`${name} total`}
          onChange={(e) => onTotalChange(e.target.value.replace(/\D/g, ''))}
          onFocus={selectAllOnFocus}
          onClick={selectAllOnClick}
          onKeyDown={(e) => focusOnEnterOrTab(e, timeRef.current)}
        />
      </div>

      <div className="tally-entry-time">
        <input
          ref={timeRef}
          type="text"
          inputMode="numeric"
          className="tally-field"
          value={timeInput}
          placeholder="56"
          aria-label={`${name} time in seconds`}
          onChange={(e) => onTimeChange(e.target.value.replace(/[^\d:]/g, ''))}
          onFocus={selectAllOnFocus}
          onClick={selectAllOnClick}
          onKeyDown={handleTimeKeyDown}
        />
        <span>s</span>
      </div>
    </li>
  );
}

function parseRowDraft(
  name: string,
  correct: string,
  total: string,
  timeInput: string,
): { name: string; correct: number; total: number; timeMs: number } | null {
  const timeMs = parseSecondsInput(timeInput);
  const correctNum = Number(correct);
  const totalNum = Number(total);
  if (timeMs === null || timeMs <= 0) return null;
  if (Number.isNaN(correctNum) || Number.isNaN(totalNum)) return null;
  if (correctNum < 0 || correctNum > totalNum || totalNum < 1) return null;
  return { name, correct: correctNum, total: totalNum, timeMs };
}

function buildChartData(
  records: TallyRecord[],
  student: string,
  metric: 'accuracy' | 'speed',
): { label: string; value: number }[] {
  const filtered = records.filter((r) => r.studentName === student);
  const sorted = [...filtered].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  return sorted.map((r) => ({
    label: formatShortDate(r.recordedAt),
    value: metric === 'accuracy' ? (r.correct / r.total) * 100 : r.timeMs / 1000,
  }));
}

const SESSION_GAP_MS = 2 * 60 * 1000;

function groupRecordsBySession(records: TallyRecord[]): TallyRecord[][] {
  if (records.length === 0) return [];

  const sorted = [...records].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  const sessions: TallyRecord[][] = [[sorted[0]]];

  for (let i = 1; i < sorted.length; i++) {
    const prevTime = new Date(sorted[i - 1].recordedAt).getTime();
    const currTime = new Date(sorted[i].recordedAt).getTime();
    if (currTime - prevTime <= SESSION_GAP_MS) {
      sessions[sessions.length - 1].push(sorted[i]);
    } else {
      sessions.push([sorted[i]]);
    }
  }

  return sessions;
}

function buildDraftSession(
  roster: string[],
  drafts: Record<string, TallyDraft>,
): TallyRecord[] {
  const session: TallyRecord[] = [];

  for (const name of roster) {
    const draft = drafts[name];
    const correct = draft?.correct ?? DEFAULT_TALLY_DRAFT.correct;
    const total = draft?.total ?? DEFAULT_TALLY_DRAFT.total;
    const time = draft?.time ?? DEFAULT_TALLY_DRAFT.time;
    const parsed = parseRowDraft(name, correct, total, time);
    if (!parsed) continue;

    session.push({
      id: `draft-${name}`,
      studentName: name,
      correct: parsed.correct,
      total: parsed.total,
      timeMs: parsed.timeMs,
      recordedAt: new Date().toISOString(),
    });
  }

  return session;
}

function sessionLabel(session: TallyRecord[], sessionIndex: number, sessions: TallyRecord[][]): string {
  const date = formatShortDate(session[0].recordedAt);
  const sameDayBefore = sessions
    .slice(0, sessionIndex)
    .filter((other) => formatShortDate(other[0].recordedAt) === date).length;

  return sameDayBefore > 0 ? `${date} · ${sameDayBefore + 1}` : date;
}

function sessionAverage(session: TallyRecord[], metric: 'accuracy' | 'speed'): number {
  if (metric === 'accuracy') {
    return (
      session.reduce((sum, record) => sum + (record.correct / record.total) * 100, 0) / session.length
    );
  }

  return session.reduce((sum, record) => sum + record.timeMs / 1000, 0) / session.length;
}

function buildClassChartData(
  records: TallyRecord[],
  roster: string[],
  drafts: Record<string, TallyDraft>,
  metric: 'accuracy' | 'speed',
): { label: string; value: number }[] {
  const rosterSet = new Set(roster);
  const classRecords = records.filter((record) => rosterSet.has(record.studentName));
  const sessions = groupRecordsBySession(classRecords);

  const todayKey = new Date().toDateString();
  const hasSavedToday = sessions.some(
    (session) => new Date(session[0].recordedAt).toDateString() === todayKey,
  );

  const allSessions = hasSavedToday
    ? sessions
    : [...sessions, ...(() => {
        const draftSession = buildDraftSession(roster, drafts);
        return draftSession.length > 0 ? [draftSession] : [];
      })()];

  return allSessions.map((session, index) => ({
    label: sessionLabel(session, index, allSessions),
    value: sessionAverage(session, metric),
  }));
}

type ChartView = 'class' | 'student';

export function ClassTally() {
  const { records, roster, drafts, addRecord, addStudent, updateDraft, setDraft, clearAll } =
    useTally();
  const [newName, setNewName] = useState('');
  const [chartView, setChartView] = useState<ChartView>('class');
  const [chartStudent, setChartStudent] = useState('');
  const [flashName, setFlashName] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const rowInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const addNameInputRef = useRef<HTMLInputElement>(null);
  const pendingFocusAddName = useRef(false);

  useEffect(() => {
    if (!pendingFocusAddName.current) return;
    pendingFocusAddName.current = false;
    addNameInputRef.current?.focus();
  }, [roster]);

  useEffect(() => {
    if (!showClearConfirm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowClearConfirm(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showClearConfirm]);

  const today = useMemo(() => new Date().toDateString(), []);

  const todayByStudent = useMemo(() => {
    const map = new Map<string, TallyRecord>();
    for (const r of records) {
      if (new Date(r.recordedAt).toDateString() === today) {
        map.set(r.studentName, r);
      }
    }
    return map;
  }, [records, today]);

  const accuracyData = useMemo(() => {
    if (chartView === 'class') {
      return buildClassChartData(records, roster, drafts, 'accuracy');
    }
    return chartStudent ? buildChartData(records, chartStudent, 'accuracy') : [];
  }, [records, roster, drafts, chartView, chartStudent]);

  const speedData = useMemo(() => {
    if (chartView === 'class') {
      return buildClassChartData(records, roster, drafts, 'speed');
    }
    return chartStudent ? buildChartData(records, chartStudent, 'speed') : [];
  }, [records, roster, drafts, chartView, chartStudent]);

  const chartTitle =
    chartView === 'class'
      ? 'Class progress'
      : chartStudent
        ? `${chartStudent}'s progress`
        : 'Student progress';

  const chartHint =
    chartView === 'student' && !chartStudent
      ? 'Click a name to see their chart.'
      : chartView === 'class' && accuracyData.length === 0
        ? 'Enter scores and click Save all to see class progress.'
        : null;

  const showClassView = () => {
    setChartView('class');
  };

  const showStudentView = () => {
    setChartView('student');
  };

  const selectStudent = (name: string) => {
    setChartStudent(name);
  };

  const getDraftValues = (name: string) => {
    const saved = drafts[name];
    if (!saved) {
      return { ...DEFAULT_TALLY_DRAFT };
    }
    return {
      correct: saved.correct ?? DEFAULT_TALLY_DRAFT.correct,
      total: saved.total ?? DEFAULT_TALLY_DRAFT.total,
      time: saved.time ?? DEFAULT_TALLY_DRAFT.time,
    };
  };

  const saveRecord = (name: string, correct: number, total: number, timeMs: number) => {
    addRecord(name, timeMs, correct, total);
    setDraft(name, {
      correct: String(correct),
      total: String(total),
      time: String(Math.round(timeMs / 1000)),
    });
  };

  const handleSaveAll = () => {
    const savedNames: string[] = [];

    for (const name of roster) {
      const draft = getDraftValues(name);
      const parsed = parseRowDraft(name, draft.correct, draft.total, draft.time);
      if (!parsed) continue;
      saveRecord(parsed.name, parsed.correct, parsed.total, parsed.timeMs);
      savedNames.push(parsed.name);
    }

    if (savedNames.length === 0) return;

    setChartStudent('');
    setChartView('class');
    setFlashName(savedNames[savedNames.length - 1]);
    setTimeout(() => setFlashName(null), 800);
  };

  const handleAddName = (e: React.FormEvent) => {
    e.preventDefault();
    if (addStudent(newName)) {
      pendingFocusAddName.current = true;
      setNewName('');
    }
  };

  const handleClearConfirm = () => {
    clearAll();
    setShowClearConfirm(false);
    setChartStudent('');
    setChartView('class');
    setFlashName(null);
    setNewName('');
  };

  return (
    <div className="tally-page">
      <header className="main-header tally-header">
        <div className="tally-header-row">
          <div>
            <h1>Class tally</h1>
            <p>Enter scores and times, then Save all.</p>
          </div>
          <button
            type="button"
            className="tally-clear-btn"
            onClick={() => setShowClearConfirm(true)}
          >
            Clear
          </button>
        </div>
      </header>

      {showClearConfirm && (
        <div
          className="tally-clear-overlay"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="tally-clear-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tally-clear-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="tally-clear-title">Clear all class data?</h2>
            <p>
              This will permanently delete all student names, saved scores, and progress
              charts. Use this when starting a new term or school year.
            </p>
            <p className="tally-clear-warning">This cannot be undone.</p>
            <div className="tally-clear-actions">
              <button
                type="button"
                className="tally-clear-cancel"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button type="button" className="tally-clear-confirm" onClick={handleClearConfirm}>
                Clear everything
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tally-layout">
        <section className="tally-simple">
          {roster.length === 0 ? (
            <form className="tally-add-name tally-add-name--solo" onSubmit={handleAddName}>
              <input
                ref={addNameInputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Add a student name…"
                autoFocus
              />
              <button type="submit" tabIndex={-1}>Add</button>
            </form>
          ) : (
            <>
              <div className="tally-entry-header">
                <span>Name</span>
                <span>Score</span>
                <span>Time</span>
              </div>

              <ul className="tally-entry-list">
                {roster.map((name, index) => {
                  const draft = getDraftValues(name);
                  return (
                    <StudentRow
                      key={name}
                      name={name}
                      correct={draft.correct}
                      total={draft.total}
                      timeInput={draft.time}
                      savedToday={todayByStudent.get(name)}
                      selected={chartStudent === name}
                      flash={flashName === name}
                      inputRef={(el) => {
                        rowInputRefs.current[index] = el;
                      }}
                      onCorrectChange={(value) => updateDraft(name, { correct: value })}
                      onTotalChange={(value) => updateDraft(name, { total: value })}
                      onTimeChange={(value) => updateDraft(name, { time: value })}
                      onSelect={selectStudent}
                      onTimeTab={() => {
                        const next = rowInputRefs.current[index + 1];
                        if (!next) return;
                        next.focus();
                        next.select();
                      }}
                    />
                  );
                })}
              </ul>

              <button type="button" className="tally-save-all" onClick={handleSaveAll}>
                Save all
              </button>

              <form className="tally-add-name" onSubmit={handleAddName}>
                <input
                  ref={addNameInputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Add another student…"
                />
                <button type="submit" tabIndex={-1}>Add</button>
              </form>
            </>
          )}
        </section>

        <section className="tally-charts">
          <div className="tally-charts-top">
            <h2>{chartTitle}</h2>
            <div className="chart-view-toggle" role="group" aria-label="Chart view">
              <button
                type="button"
                className={`chart-view-btn ${chartView === 'class' ? 'active' : ''}`}
                onClick={showClassView}
              >
                Class
              </button>
              <button
                type="button"
                className={`chart-view-btn ${chartView === 'student' ? 'active' : ''}`}
                onClick={showStudentView}
              >
                Student
              </button>
            </div>
          </div>

          {chartHint && <p className="tally-chart-hint">{chartHint}</p>}

          <div className="charts-stack" key={chartView}>
            <ProgressChart
              key={`${chartView}-accuracy`}
              title="Accuracy"
              data={accuracyData}
              unit="%"
              color="#8b5cf6"
              formatValue={(v) => `${Math.round(v)}`}
            />
            <ProgressChart
              key={`${chartView}-speed`}
              title="Speed"
              data={speedData}
              unit="seconds"
              color="#06b6d4"
              formatValue={(v) => `${Math.round(v)}s`}
              lowerIsBetter
            />
          </div>
        </section>
      </div>
    </div>
  );
}
