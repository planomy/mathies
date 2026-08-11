export type DrillOp = '+' | '-' | '×' | '÷';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionMode = 'drill' | 'set';

export type YearLevel = 'y4' | 'y5' | 'y6';

export const ALL_DRILL_OPS: DrillOp[] = ['+', '-', '×', '÷'];

export interface DrillQuestion {
  kind: 'drill';
  a: number;
  b: number;
  operation: DrillOp;
  answer: number;
}

export interface PromptQuestion {
  kind: 'prompt';
  prompt: string;
  answer: string;
}

export type Question = DrillQuestion | PromptQuestion;

export interface ColumnConfig {
  id: number;
  label: string;
  difficulty: Difficulty;
  questionCount: number;
  operations: DrillOp[];
  leftMin: number;
  leftMax: number;
  rightMin: number;
  rightMax: number;
  questionMode: QuestionMode;
  /** When false, column is faded in setup and hidden in focus mode. */
  active: boolean;
}

export const YEAR_LEVEL_LABELS: Record<YearLevel, string> = {
  y4: 'Year 4',
  y5: 'Year 5',
  y6: 'Year 6',
};

export const MENTAL_SET_MIN = 10;
export const MENTAL_SET_SIZE = 20;

export function clampMentalSetCount(count: number): number {
  if (!Number.isFinite(count)) return MENTAL_SET_SIZE;
  return Math.max(MENTAL_SET_MIN, Math.min(MENTAL_SET_SIZE, Math.round(count)));
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 0,
    label: 'Starters',
    difficulty: 'easy',
    questionCount: 10,
    operations: [...ALL_DRILL_OPS],
    leftMin: 1,
    leftMax: 5,
    rightMin: 1,
    rightMax: 5,
    questionMode: 'drill',
    active: true,
  },
  {
    id: 1,
    label: 'Rising Stars',
    difficulty: 'easy',
    questionCount: 10,
    operations: [...ALL_DRILL_OPS],
    leftMin: 3,
    leftMax: 12,
    rightMin: 3,
    rightMax: 12,
    questionMode: 'drill',
    active: true,
  },
  {
    id: 2,
    label: 'Champions',
    difficulty: 'medium',
    questionCount: 10,
    operations: [...ALL_DRILL_OPS],
    leftMin: 5,
    leftMax: 15,
    rightMin: 5,
    rightMax: 15,
    questionMode: 'drill',
    active: true,
  },
  {
    id: 3,
    label: 'Legends',
    difficulty: 'hard',
    questionCount: 10,
    operations: [...ALL_DRILL_OPS],
    leftMin: 8,
    leftMax: 20,
    rightMin: 8,
    rightMax: 20,
    questionMode: 'drill',
    active: true,
  },
];

export const COLUMN_MASCOTS: Record<number, string> = {
  0: 'mascots/starters.png?v=2',
  1: 'mascots/rising-stars.png?v=2',
  2: 'mascots/champions.png?v=2',
  3: 'mascots/legends.png?v=2',
};

export type AppView = 'practice' | 'tally';

export interface TallyRecord {
  id: string;
  studentName: string;
  timeMs: number;
  correct: number;
  total: number;
  recordedAt: string;
}

export interface TallyDraft {
  correct: string;
  total: string;
  time: string;
}

export const DEFAULT_TALLY_DRAFT: TallyDraft = {
  correct: '',
  total: '10',
  time: '',
};
