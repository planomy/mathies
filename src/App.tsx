import { useCallback, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Timer } from './components/Timer';
import { Column } from './components/Column';
import { CheckButton } from './components/CheckButton';
import { ClassTally } from './components/ClassTally';
import { FontResizer } from './components/FontResizer';
import { useTimer } from './hooks/useTimer';
import { useDarkMode } from './hooks/useDarkMode';
import { useFontSize } from './hooks/useFontSize';
import { DEFAULT_COLUMNS, type AppView, type ColumnConfig, type Question } from './types';
import { generateQuestions } from './utils/mathGenerator';
import './App.css';

const EMPTY_QUESTIONS: Question[][] = [[], [], [], []];

function buildAllQuestions(columns: ColumnConfig[]): Question[][] {
  return columns.map((col) =>
    generateQuestions(col.questionCount, col.difficulty, col.operation),
  );
}

export default function App() {
  const [view, setView] = useState<AppView>('practice');
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [questions, setQuestions] = useState<Question[][]>(EMPTY_QUESTIONS);
  const [showAnswers, setShowAnswers] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [seed, setSeed] = useState(0);

  const { dark, toggle: toggleDark } = useDarkMode();
  const { elapsed, running, waiting, start, startDelayed, pause, reset } = useTimer();
  const fontSize = useFontSize();

  const exitFocus = useCallback(() => {
    setFocusMode(false);
    setShowAnswers(false);
    setQuestions(EMPTY_QUESTIONS);
  }, []);

  const regenerate = useCallback(() => {
    exitFocus();
    reset();
    setSeed((s) => s + 1);
  }, [exitFocus, reset]);

  const handleConfigChange = useCallback(
    (id: number, updates: Partial<ColumnConfig>) => {
      setColumns((prev) => prev.map((col) => (col.id === id ? { ...col, ...updates } : col)));
      setShowAnswers(false);
    },
    [],
  );

  const handleStart = useCallback(() => {
    if (!focusMode) {
      setQuestions(buildAllQuestions(columns));
      setShowAnswers(false);
      setFocusMode(true);
      setSeed((s) => s + 1);
      startDelayed(1000);
    } else {
      start();
    }
  }, [focusMode, columns, start, startDelayed]);

  const handleReset = useCallback(() => {
    reset();
    exitFocus();
  }, [reset, exitFocus]);

  const handleNavigate = useCallback(
    (next: AppView) => {
      if (next !== 'practice' && focusMode) {
        pause();
      }
      setView(next);
    },
    [focusMode, pause],
  );

  const handleNewQuestions = useCallback(() => {
    setView('practice');
    regenerate();
  }, [regenerate]);

  const totalQuestions = useMemo(
    () => columns.reduce((sum, col) => sum + col.questionCount, 0),
    [columns],
  );

  return (
    <div className="app">
      <Sidebar
        view={view}
        dark={dark}
        elapsed={elapsed}
        timerVisible={focusMode}
        timerWaiting={waiting}
        timerRunning={running}
        onNavigate={handleNavigate}
        onToggleDark={toggleDark}
        onNewQuestions={handleNewQuestions}
        onStopTimer={pause}
      />

      <main className={`main ${focusMode ? 'main--focus' : ''}`}>
        {view === 'practice' ? (
          <>
            {!focusMode && (
              <Timer
                running={running}
                waiting={waiting}
                onStart={handleStart}
                onPause={pause}
                onReset={handleReset}
              />
            )}

            <div className="columns-grid" key={seed}>
              {columns.map((col, i) => (
                <Column
                  key={col.id}
                  config={col}
                  questions={questions[i]}
                  showAnswers={showAnswers}
                  focusMode={focusMode}
                  onConfigChange={handleConfigChange}
                />
              ))}
            </div>

            {focusMode && (
              <div className="focus-footer">
                <FontResizer
                  label={fontSize.label}
                  canIncrease={fontSize.canIncrease}
                  canDecrease={fontSize.canDecrease}
                  onIncrease={fontSize.increase}
                  onDecrease={fontSize.decrease}
                  onReset={fontSize.reset}
                />
                <CheckButton
                  showAnswers={showAnswers}
                  onToggle={() => setShowAnswers((v) => !v)}
                />
              </div>
            )}
          </>
        ) : (
          <ClassTally defaultTimeMs={elapsed} defaultTotal={totalQuestions} />
        )}
      </main>
    </div>
  );
}
