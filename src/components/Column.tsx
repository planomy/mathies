import type { ColumnConfig, DrillOp, Question } from '../types';
import {
  ALL_DRILL_OPS,
  COLUMN_MASCOTS,
  MENTAL_SET_MIN,
  MENTAL_SET_SIZE,
  clampMentalSetCount,
} from '../types';
import { assetUrl } from '../utils/assetUrl';
import { formatAnswer, getQuestionText } from '../utils/questionDisplay';

interface ColumnProps {
  config: ColumnConfig;
  questions: Question[];
  showAnswers: boolean;
  focusMode: boolean;
  canDeactivate: boolean;
  onConfigChange: (id: number, updates: Partial<ColumnConfig>) => void;
  onToggleActive: (id: number) => void;
}

export function Column({
  config,
  questions,
  showAnswers,
  focusMode,
  canDeactivate,
  onConfigChange,
  onToggleActive,
}: ColumnProps) {
  const isSetMode = config.questionMode === 'set';
  const inactive = !config.active;
  const setCount = clampMentalSetCount(config.questionCount);
  const leftLow = Math.min(config.leftMin, config.leftMax);
  const leftHigh = Math.max(config.leftMin, config.leftMax);
  const rightLow = Math.min(config.rightMin, config.rightMax);
  const rightHigh = Math.max(config.rightMin, config.rightMax);
  const rangeOperator = config.operations.length === 1 ? config.operations[0] : 'mixed';

  const toggleOperation = (op: DrillOp) => {
    if (inactive) return;
    const selected = config.operations;
    if (selected.includes(op)) {
      if (selected.length === 1) return;
      onConfigChange(config.id, {
        questionMode: 'drill',
        operations: selected.filter((value) => value !== op),
      });
      return;
    }

    onConfigChange(config.id, {
      questionMode: 'drill',
      operations: [...selected, op],
    });
  };

  const handleQuestionCountChange = (raw: string) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;

    if (isSetMode) {
      // Allow typing below 10 mid-edit; clamp the floor on blur.
      onConfigChange(config.id, {
        questionCount: Math.max(1, Math.min(MENTAL_SET_SIZE, Math.round(parsed))),
      });
      return;
    }

    onConfigChange(config.id, {
      questionCount: Math.max(1, Math.min(30, Math.round(parsed))),
    });
  };

  const handleQuestionCountBlur = () => {
    if (!isSetMode) return;
    const next = clampMentalSetCount(config.questionCount);
    if (next !== config.questionCount) {
      onConfigChange(config.id, { questionCount: next });
    }
  };

  const handleRangeChange = (
    field: 'leftMin' | 'leftMax' | 'rightMin' | 'rightMax',
    raw: string,
  ) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    onConfigChange(config.id, {
      [field]: Math.max(0, Math.min(100, Math.round(parsed))),
    });
  };

  return (
    <div
      className={[
        'column-card',
        focusMode ? 'column-card--focus' : '',
        !focusMode && inactive ? 'column-card--inactive' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="column-header">
        <div className="column-header-text">
          <h2>{config.label}</h2>
          {!focusMode && (
            <span className="difficulty-badge">
              {inactive
                ? 'Off for this session'
                : isSetMode
                  ? `${setCount}-question mental set`
                  : `${leftLow}–${leftHigh} ${rangeOperator} ${rightLow}–${rightHigh}`}
            </span>
          )}
        </div>

        {!focusMode && (
          <>
            <label
              className="column-active-toggle"
              title={
                inactive
                  ? `Include ${config.label}`
                  : canDeactivate
                    ? `Hide ${config.label}`
                    : 'Keep at least one group on'
              }
            >
              <input
                type="checkbox"
                checked={config.active}
                disabled={config.active && !canDeactivate}
                onChange={() => onToggleActive(config.id)}
                aria-label={`Include ${config.label}`}
              />
              <span>On</span>
            </label>
            <img
              src={assetUrl(COLUMN_MASCOTS[config.id])}
              alt=""
              className="column-mascot"
            />
          </>
        )}
      </div>

      {!focusMode && (
        <div className={`column-settings ${inactive ? 'is-disabled' : ''}`} aria-disabled={inactive}>
          <label className="setting-field">
            <span>Questions</span>
            <input
              type="number"
              min={isSetMode ? MENTAL_SET_MIN : 1}
              max={isSetMode ? MENTAL_SET_SIZE : 30}
              value={config.questionCount}
              disabled={inactive}
              title={isSetMode ? `Mental set length (${MENTAL_SET_MIN}–${MENTAL_SET_SIZE})` : undefined}
              onChange={(e) => handleQuestionCountChange(e.target.value)}
              onBlur={handleQuestionCountBlur}
            />
          </label>

          <div className="setting-field">
            <span>Operations</span>
            <div className="op-buttons">
              {ALL_DRILL_OPS.map((op) => (
                <button
                  key={op}
                  type="button"
                  className={`op-btn ${!isSetMode && config.operations.includes(op) ? 'active' : ''}`}
                  onClick={() => toggleOperation(op)}
                  disabled={inactive}
                  aria-pressed={!isSetMode && config.operations.includes(op)}
                >
                  {op}
                </button>
              ))}
              <button
                type="button"
                className={`op-btn op-btn-set ${isSetMode ? 'active' : ''}`}
                title={`Mental maths set (${MENTAL_SET_MIN}–${MENTAL_SET_SIZE} questions)`}
                disabled={inactive}
                onClick={() =>
                  onConfigChange(config.id, {
                    questionMode: 'set',
                    questionCount: clampMentalSetCount(config.questionCount),
                  })
                }
              >
                Set
              </button>
            </div>
          </div>

          {!isSetMode && (
            <div className="setting-field range-setting">
              <span>Number ranges</span>
              <div className="range-controls">
                <div className="range-pair" aria-label="First number range">
                  <small>First</small>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={config.leftMin}
                    disabled={inactive}
                    aria-label="First number minimum"
                    onChange={(e) => handleRangeChange('leftMin', e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={config.leftMax}
                    disabled={inactive}
                    aria-label="First number maximum"
                    onChange={(e) => handleRangeChange('leftMax', e.target.value)}
                  />
                </div>

                <strong className="range-operator" aria-hidden="true">
                  {config.operations.length === 1 ? config.operations[0] : '◆'}
                </strong>

                <div className="range-pair" aria-label="Second number range">
                  <small>Second</small>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={config.rightMin}
                    disabled={inactive}
                    aria-label="Second number minimum"
                    onChange={(e) => handleRangeChange('rightMin', e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={config.rightMax}
                    disabled={inactive}
                    aria-label="Second number maximum"
                    onChange={(e) => handleRangeChange('rightMax', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {focusMode && (
        <ol className="question-list">
          {questions.map((q, i) => (
            <li key={i} className="question-item">
              <span className="question-num">{i + 1}.</span>
              <span className="question-text">{getQuestionText(q)}</span>
              <span
                className={`question-answer ${showAnswers ? 'is-visible' : ''}`}
                aria-hidden={!showAnswers}
                title={showAnswers ? formatAnswer(q) : undefined}
              >
                {formatAnswer(q)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
