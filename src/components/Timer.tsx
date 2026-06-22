interface TimerProps {
  running: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  focusMode?: boolean;
}

export function Timer({ running, onStart, onPause, onReset, focusMode }: TimerProps) {
  if (focusMode) return null;

  return (
    <div className="setup-controls">
      <p className="setup-controls-hint">
        Configure your columns, then hit start. Questions appear in focus mode and the teacher
        starts the sidebar timer with Go when ready.
      </p>
      <div className="setup-controls-buttons">
        {running ? (
          <button className="btn btn-setup btn-setup-pause" type="button" onClick={onPause}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
            Pause
          </button>
        ) : (
          <button className="btn btn-setup btn-setup-start" type="button" onClick={onStart}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Start
          </button>
        )}
        <button className="btn btn-setup btn-setup-reset" type="button" onClick={onReset}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset
        </button>
      </div>
    </div>
  );
}
