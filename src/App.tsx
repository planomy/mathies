import { useCallback, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Timer } from './components/Timer';
import { Column } from './components/Column';
import { CheckButton } from './components/CheckButton';
import { ClassTally } from './components/ClassTally';
import { FontResizer } from './components/FontResizer';
import { useTimer } from './hooks/useTimer';
import { useDarkMode } from './hooks/useDarkMode';
import { useFontSize } from './hooks/useFontSize';
import { useYearLevel } from './hooks/useYearLevel';
import { DEFAULT_COLUMNS, type AppView, type ColumnConfig, type Question, type YearLevel } from './types';
import { generateMentalSet } from './utils/mentalSetGenerator';
import { generateQuestions } from './utils/mathGenerator';
import './App.css';

const EMPTY_QUESTIONS: Question[][] = [[], [], [], []];

function buildColumnQuestions(col: ColumnConfig, yearLevel: YearLevel): Question[] {
  if (col.questionMode === 'set') {
    return generateMentalSet(yearLevel, col.id);
  }
  return generateQuestions(col.questionCount, col.id, yearLevel, col.operations);
}

function buildAllQuestions(columns: ColumnConfig[], yearLevel: YearLevel): Question[][] {
  return columns.map((col) => buildColumnQuestions(col, yearLevel));
}

export default function App() {
  const [view, setView] = useState<AppView>('practice');
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [questions, setQuestions] = useState<Question[][]>(EMPTY_QUESTIONS);
  const [showAnswers, setShowAnswers] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [seed, setSeed] = useState(0);

  const { dark, toggle: toggleDark } = useDarkMode();
  const { yearLevel, setYearLevel } = useYearLevel();
  const { elapsed, running, start, pause, reset } = useTimer();
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
    setQuestions(buildAllQuestions(columns, yearLevel));
    setShowAnswers(false);
    setFocusMode(true);
    setSeed((s) => s + 1);
  }, [columns, yearLevel]);

  const handleReset = useCallback(() => {
    reset();
    exitFocus();
  }, [reset, exitFocus]);

  const handleFocusReset = useCallback(() => {
    reset();
    setQuestions(buildAllQuestions(columns, yearLevel));
    setShowAnswers(false);
    setSeed((s) => s + 1);
  }, [reset, columns, yearLevel]);

  const handleTimerGo = useCallback(() => {
    start();
  }, [start]);

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

  return (
    <div className="app">
      <Sidebar
        view={view}
        dark={dark}
        elapsed={elapsed}
        timerVisible={focusMode}
        timerRunning={running}
        yearLevel={yearLevel}
        onYearLevelChange={setYearLevel}
        onNavigate={handleNavigate}
        onToggleDark={toggleDark}
        onNewQuestions={handleNewQuestions}
        onGoTimer={handleTimerGo}
        onStopTimer={pause}
      />

      <main className={`main ${focusMode ? 'main--focus' : ''}`}>
        {view === 'practice' ? (
          <>
            {!focusMode && (
              <Timer
                running={running}
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
                  onReset={handleFocusReset}
                />
              </div>
            )}
          </>
        ) : (
          <ClassTally />
        )}
      </main>
    </div>
  );
}
