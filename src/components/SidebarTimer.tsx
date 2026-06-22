import { splitTime } from '../hooks/useTimer';

interface SidebarTimerProps {
  elapsed: number;
  visible: boolean;
  waiting: boolean;
  running: boolean;
  onStop: () => void;
}

export function SidebarTimer({ elapsed, visible, waiting, running, onStop }: SidebarTimerProps) {
  if (!visible) return null;

  const { minutes, seconds, centiseconds } = splitTime(elapsed);
  const canStop = running || waiting;
  const status = waiting ? 'Ready' : running ? 'Running' : 'Paused';

  return (
    <div
      className={`sidebar-timer ${waiting ? 'is-ready' : ''} ${running ? 'is-running' : ''}`}
    >
      <div className="sidebar-timer-card">
        <div className="sidebar-timer-header">
          <span className="sidebar-timer-title">Timer</span>
          <span
            className={`sidebar-timer-badge ${running && !waiting ? 'sidebar-timer-badge--live' : ''}`}
          >
            {running && !waiting && <span className="sidebar-timer-pulse" aria-hidden="true" />}
            {status}
          </span>
        </div>

        <div
          className="sidebar-timer-face"
          aria-live="polite"
          aria-label={
            waiting ? 'Ready' : `Elapsed time ${minutes} minutes, ${seconds} seconds`
          }
        >
          {waiting ? (
            <span className="sidebar-timer-ready">Ready</span>
          ) : (
            <div className="sidebar-timer-digits">
              <span className="sidebar-timer-main">{minutes}</span>
              <span className="sidebar-timer-sep">:</span>
              <span className="sidebar-timer-main">{seconds}</span>
              <span className="sidebar-timer-cents">.{centiseconds}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="sidebar-timer-stop"
          onClick={onStop}
          disabled={!canStop}
          aria-label="Stop timer"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="7" y="7" width="10" height="10" rx="1.5" />
          </svg>
          Stop
        </button>
      </div>
    </div>
  );
}
