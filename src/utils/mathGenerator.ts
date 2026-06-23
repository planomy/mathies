import type { DrillOp, DrillQuestion, YearLevel } from '../types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function yearFactor(year: YearLevel): number {
  return { y4: 0.82, y5: 1, y6: 1.15 }[year];
}

function scaledRange(
  columnId: number,
  year: YearLevel,
  mins: readonly [number, number, number, number],
  maxs: readonly [number, number, number, number],
): { min: number; max: number } {
  const factor = yearFactor(year);
  const min = Math.max(1, Math.round(mins[columnId] * factor));
  const max = Math.max(min + 1, Math.round(maxs[columnId] * factor));
  return { min, max };
}

function getRange(
  columnId: number,
  year: YearLevel,
  op: DrillOp,
): { min: number; max: number } {
  if (op === '+' || op === '-') {
    return scaledRange(columnId, year, [1, 3, 5, 8], [5, 12, 15, 20]);
  }
  return scaledRange(columnId, year, [1, 2, 2, 3], [5, 9, 12, 12]);
}

function pickOp(operations: DrillOp[]): DrillOp {
  return operations[randInt(0, operations.length - 1)];
}

function generateOne(
  columnId: number,
  year: YearLevel,
  operations: DrillOp[],
): DrillQuestion {
  const op = pickOp(operations);
  const { min, max } = getRange(columnId, year, op);

  switch (op) {
    case '+': {
      const a = randInt(min, max);
      const b = randInt(min, max);
      return { kind: 'drill', a, b, operation: '+', answer: a + b };
    }
    case '-': {
      const a = randInt(min, max);
      const b = randInt(min, a);
      return { kind: 'drill', a, b, operation: '-', answer: a - b };
    }
    case '×': {
      const a = randInt(min, max);
      const b = randInt(min, max);
      return { kind: 'drill', a, b, operation: '×', answer: a * b };
    }
    case '÷': {
      const b = randInt(Math.max(min, 1), max);
      const quotient = randInt(min, max);
      const a = b * quotient;
      return { kind: 'drill', a, b, operation: '÷', answer: quotient };
    }
  }
}

export function generateQuestions(
  count: number,
  columnId: number,
  year: YearLevel,
  operations: DrillOp[],
): DrillQuestion[] {
  const ops = operations.length > 0 ? operations : (['+'] as DrillOp[]);
  return Array.from({ length: count }, () => generateOne(columnId, year, ops));
}
