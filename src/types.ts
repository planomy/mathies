export type Operation = '+' | '-' | '×' | '÷' | 'mixed';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  a: number;
  b: number;
  operation: '+' | '-' | '×' | '÷';
  answer: number;
}

export interface ColumnConfig {
  id: number;
  label: string;
  difficulty: Difficulty;
  questionCount: number;
  operation: Operation;
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 0, label: 'Starters', difficulty: 'easy', questionCount: 10, operation: 'mixed' },
  { id: 1, label: 'Rising Stars', difficulty: 'easy', questionCount: 10, operation: 'mixed' },
  { id: 2, label: 'Champions', difficulty: 'medium', questionCount: 10, operation: 'mixed' },
  { id: 3, label: 'Legends', difficulty: 'hard', questionCount: 10, operation: 'mixed' },
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
