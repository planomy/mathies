import type { ColumnConfig, DrillOp, Question } from '../types';
import { ALL_DRILL_OPS, COLUMN_DRILL_HINTS, COLUMN_MASCOTS, MENTAL_SET_SIZE } from '../types';
import { assetUrl } from '../utils/assetUrl';
import { formatAnswer, getQuestionText } from '../utils/questionDisplay';

interface ColumnProps {
  config: ColumnConfig;
  questions: Question[];
  showAnswers: boolean;
  focusMode: boolean;
  onConfigChange: (id: number, updates: Partial<ColumnConfig>) => void;
}

export function Column({ config, questions, showAnswers, focusMode, onConfigChange }: ColumnProps) {
  const isSetMode = config.questionMode === 'set';

  const toggleOperation = (op: DrillOp) => {
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

  return (
    <div className={`column-card ${focusMode ? 'column-card--focus' : ''}`}>
      <div className="column-header">
        <div className="column-header-text">
          <h2>{config.label}</h2>
          {!focusMode && (
            <span className="difficulty-badge">
              {isSetMode ? '20-question mental set' : COLUMN_DRILL_HINTS[config.id]}
            </span>
          )}
        </div>
        {!focusMode && (
          <img
            src={assetUrl(COLUMN_MASCOTS[config.id])}
            alt=""
            className="column-mascot"
          />
        )}
      </div>

      {!focusMode && (
        <div className="column-settings">
          <label className="setting-field">
            <span>Questions</span>
            <input
              type="number"
              min={1}
              max={30}
              value={isSetMode ? MENTAL_SET_SIZE : config.questionCount}
              disabled={isSetMode}
              onChange={(e) =>
                onConfigChange(config.id, {
                  questionCount: Math.max(1, Math.min(30, Number(e.target.value) || 1)),
                })
              }
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
                  aria-pressed={!isSetMode && config.operations.includes(op)}
                >
                  {op}
                </button>
              ))}
              <button
                type="button"
                className={`op-btn op-btn-set ${isSetMode ? 'active' : ''}`}
                title="20-question mental maths set"
                onClick={() =>
                  onConfigChange(config.id, {
                    questionMode: 'set',
                    questionCount: MENTAL_SET_SIZE,
                  })
                }
              >
                Set
              </button>
            </div>
          </div>
        </div>
      )}

      {focusMode && (
        <ol className="question-list">
          {questions.map((q, i) => (
            <li key={i} className="question-item">
              <span className="question-num">{i + 1}.</span>
              <span className="question-text">{getQuestionText(q)}</span>
              {showAnswers && <span className="question-answer">{formatAnswer(q)}</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
