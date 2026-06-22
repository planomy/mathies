interface CheckButtonProps {
  showAnswers: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export function CheckButton({ showAnswers, onToggle, onReset }: CheckButtonProps) {
  return (
    <div className="check-section">
      <button
        className={`btn btn-check ${showAnswers ? 'revealed' : ''}`}
        type="button"
        onClick={onToggle}
      >
        {showAnswers ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            Hide answers
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Check answers
          </>
        )}
      </button>
      <button className="btn btn-setup btn-setup-reset btn-focus-reset" type="button" onClick={onReset}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Reset
      </button>
    </div>
  );
}
