interface FontResizerProps {
  label: string;
  canIncrease: boolean;
  canDecrease: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onReset: () => void;
}

export function FontResizer({
  label,
  canIncrease,
  canDecrease,
  onIncrease,
  onDecrease,
  onReset,
}: FontResizerProps) {
  return (
    <div className="font-resizer">
      <div className="font-resizer-controls">
        <button
          type="button"
          className="font-resizer-btn"
          onClick={onDecrease}
          disabled={!canDecrease}
          aria-label="Decrease question text size"
        >
          A−
        </button>
        <button type="button" className="font-resizer-value" onClick={onReset} title="Reset to default">
          {label}
        </button>
        <button
          type="button"
          className="font-resizer-btn"
          onClick={onIncrease}
          disabled={!canIncrease}
          aria-label="Increase question text size"
        >
          A+
        </button>
      </div>
    </div>
  );
}
