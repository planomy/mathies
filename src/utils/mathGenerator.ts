import type { Difficulty, Operation, Question } from '../types';

const OPS = ['+', '-', '×', '÷'] as const;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOp(operation: Operation): '+' | '-' | '×' | '÷' {
  if (operation === 'mixed') {
    return OPS[randInt(0, OPS.length - 1)];
  }
  return operation;
}

function getRange(difficulty: Difficulty, op: '+' | '-' | '×' | '÷'): { min: number; max: number } {
  if (difficulty === 'easy') return { min: 1, max: 5 };
  if (difficulty === 'medium') return { min: 5, max: 10 };
  if (op === '+' || op === '-') return { min: 1, max: 20 };
  return { min: 1, max: 12 };
}

function generateOne(difficulty: Difficulty, operation: Operation): Question {
  const op = pickOp(operation);
  const { min, max } = getRange(difficulty, op);

  switch (op) {
    case '+': {
      const a = randInt(min, max);
      const b = randInt(min, max);
      return { a, b, operation: '+', answer: a + b };
    }
    case '-': {
      const a = randInt(min, max);
      const b = randInt(min, a);
      return { a, b, operation: '-', answer: a - b };
    }
    case '×': {
      const a = randInt(min, max);
      const b = randInt(min, max);
      return { a, b, operation: '×', answer: a * b };
    }
    case '÷': {
      const b = randInt(Math.max(min, 1), max);
      const quotient = randInt(min, max);
      const a = b * quotient;
      return { a, b, operation: '÷', answer: quotient };
    }
  }
}

export function generateQuestions(
  count: number,
  difficulty: Difficulty,
  operation: Operation,
): Question[] {
  return Array.from({ length: count }, () => generateOne(difficulty, operation));
}
