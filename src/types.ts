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
  questionMode: QuestionMode;
}

export const YEAR_LEVEL_LABELS: Record<YearLevel, string> = {
  y4: 'Year 4',
  y5: 'Year 5',
  y6: 'Year 6',
};

export const COLUMN_DRILL_HINTS: Record<number, string> = {
  0: 'Numbers 1–5',
  1: 'Numbers 3–12',
  2: 'Numbers 5–15',
  3: 'Bigger numbers',
};

export const MENTAL_SET_SIZE = 20;

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 0,
    label: 'Starters',
    difficulty: 'easy',
    questionCount: 10,
    operations: [...ALL_DRILL_OPS],
    questionMode: 'drill',
  },
  {
    id: 1,
    label: 'Rising Stars',
    difficulty: 'easy',
    questionCount: 10,
    operations: [...ALL_DRILL_OPS],
    questionMode: 'drill',
  },
  {
    id: 2,
    label: 'Champions',
    difficulty: 'medium',
    questionCount: 10,
    operations: [...ALL_DRILL_OPS],
    questionMode: 'drill',
  },
  {
    id: 3,
    label: 'Legends',
    difficulty: 'hard',
    questionCount: 10,
    operations: [...ALL_DRILL_OPS],
    questionMode: 'drill',
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
