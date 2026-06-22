import { splitTime } from '../hooks/useTimer';

interface SidebarTimerProps {
  elapsed: number;
  visible: boolean;
  running: boolean;
  onGo: () => void;
  onStop: () => void;
}

export function SidebarTimer({ elapsed, visible, running, onGo, onStop }: SidebarTimerProps) {
  if (!visible) return null;

  const { minutes, seconds, centiseconds } = splitTime(elapsed);
  const status = running ? 'Running' : elapsed > 0 ? 'Paused' : 'Idle';

  return (
    <div className={`sidebar-timer ${running ? 'is-running' : ''}`}>
      <div className="sidebar-timer-card">
        <div className="sidebar-timer-header">
          <span className="sidebar-timer-title">Timer</span>
          <span className={`sidebar-timer-badge ${running ? 'sidebar-timer-badge--live' : ''}`}>
            {running && <span className="sidebar-timer-pulse" aria-hidden="true" />}
            {status}
          </span>
        </div>

        <div
          className="sidebar-timer-face"
          aria-live="polite"
          aria-label={`Elapsed time ${minutes} minutes, ${seconds} seconds`}
        >
          <div className="sidebar-timer-digits">
            <span className="sidebar-timer-main">{minutes}</span>
            <span className="sidebar-timer-sep">:</span>
            <span className="sidebar-timer-main">{seconds}</span>
            <span className="sidebar-timer-cents">.{centiseconds}</span>
          </div>
        </div>

        <button
          type="button"
          className={`sidebar-timer-action ${running ? 'sidebar-timer-stop' : 'sidebar-timer-go'}`}
          onClick={running ? onStop : onGo}
          aria-label={running ? 'Stop timer' : 'Start timer'}
        >
          {running ? (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="7" y="7" width="10" height="10" rx="1.5" />
              </svg>
              Stop
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Go
            </>
          )}
        </button>
      </div>
    </div>
  );
}
