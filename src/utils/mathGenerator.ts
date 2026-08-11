import type { DrillOp, DrillQuestion } from '../types';

interface NumberRange {
  min: number;
  max: number;
}

export interface FactRanges {
  left: NumberRange;
  right: NumberRange;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normaliseRange(range: NumberRange): NumberRange {
  return {
    min: Math.min(range.min, range.max),
    max: Math.max(range.min, range.max),
  };
}

function pickOp(operations: DrillOp[]): DrillOp {
  return operations[randInt(0, operations.length - 1)];
}

function generateOne(
  operations: DrillOp[],
  ranges: FactRanges,
): DrillQuestion {
  const op = pickOp(operations);
  const left = normaliseRange(ranges.left);
  const right = normaliseRange(ranges.right);
  const a = randInt(left.min, left.max);
  const b = randInt(right.min, right.max);

  switch (op) {
    case '+': {
      return { kind: 'drill', a, b, operation: '+', answer: a + b };
    }
    case '-': {
      return { kind: 'drill', a, b, operation: '-', answer: a - b };
    }
    case '×': {
      return { kind: 'drill', a, b, operation: '×', answer: a * b };
    }
    case '÷': {
      for (let attempt = 0; attempt < 50; attempt += 1) {
        const dividend = randInt(left.min, left.max);
        const divisor = randInt(right.min, right.max);
        if (divisor !== 0 && dividend % divisor === 0) {
          return {
            kind: 'drill',
            a: dividend,
            b: divisor,
            operation: '÷',
            answer: dividend / divisor,
          };
        }
      }

      const divisor = b === 0 ? 1 : b;
      return {
        kind: 'drill',
        a,
        b: divisor,
        operation: '÷',
        answer: Number((a / divisor).toFixed(2)),
      };
    }
  }
}

export function generateQuestions(
  count: number,
  operations: DrillOp[],
  ranges: FactRanges,
): DrillQuestion[] {
  const ops = operations.length > 0 ? operations : (['+'] as DrillOp[]);
  return Array.from({ length: count }, () => generateOne(ops, ranges));
}
