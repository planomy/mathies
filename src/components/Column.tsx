import type { ColumnConfig, Question } from '../types';
import { COLUMN_MASCOTS } from '../types';
import type { Operation } from '../types';
import { assetUrl } from '../utils/assetUrl';

const OPERATIONS: Operation[] = ['+', '-', '×', '÷', 'mixed'];

const DIFFICULTY_HINTS: Record<string, string> = {
  easy: 'Numbers 1–5',
  medium: 'Numbers 5–10',
  hard: 'Bigger numbers',
};

interface ColumnProps {
  config: ColumnConfig;
  questions: Question[];
  showAnswers: boolean;
  focusMode: boolean;
  onConfigChange: (id: number, updates: Partial<ColumnConfig>) => void;
}

export function Column({ config, questions, showAnswers, focusMode, onConfigChange }: ColumnProps) {
  return (
    <div className={`column-card ${focusMode ? 'column-card--focus' : ''}`}>
      <div className="column-header">
        <div className="column-header-text">
          <h2>{config.label}</h2>
          {!focusMode && (
            <span className="difficulty-badge">{DIFFICULTY_HINTS[config.difficulty]}</span>
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
              value={config.questionCount}
              onChange={(e) =>
                onConfigChange(config.id, {
                  questionCount: Math.max(1, Math.min(30, Number(e.target.value) || 1)),
                })
              }
            />
          </label>

          <div className="setting-field">
            <span>Operation</span>
            <div className="op-buttons">
              {OPERATIONS.map((op) => (
                <button
                  key={op}
                  type="button"
                  className={`op-btn ${config.operation === op ? 'active' : ''}`}
                  onClick={() => onConfigChange(config.id, { operation: op })}
                >
                  {op === 'mixed' ? 'Mix' : op}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {focusMode && (
        <ol className="question-list">
          {questions.map((q, i) => (
            <li key={i} className="question-item">
              <span className="question-num">{i + 1}.</span>
              <span className="question-text">
                {q.a} {q.operation} {q.b} =
              </span>
              {showAnswers && <span className="question-answer">{q.answer}</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
