import type { PromptQuestion, YearLevel } from '../types';

type GenContext = {
  year: YearLevel;
  columnId: number;
};

const FACTOR_TARGETS = [
  [12, 18, 24],
  [24, 30, 36],
  [36, 42, 48],
  [48, 56, 60],
] as const;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function variant(ctx: GenContext): number {
  return ctx.columnId % 2;
}

function yearFactor(year: YearLevel): number {
  return { y4: 0.82, y5: 1, y6: 1.15 }[year];
}

function scaleValue(value: number, year: YearLevel): number {
  return Math.max(1, Math.round(value * yearFactor(year)));
}

function colPick(ctx: GenContext, values: readonly [number, number, number, number]): number {
  const raw = values[ctx.columnId] ?? values[2];
  return scaleValue(raw, ctx.year);
}

function colRange(
  ctx: GenContext,
  mins: readonly [number, number, number, number],
  maxs: readonly [number, number, number, number],
): number {
  const min = scaleValue(mins[ctx.columnId], ctx.year);
  const max = scaleValue(maxs[ctx.columnId], ctx.year);
  return randInt(min, Math.max(min, max));
}

function colDigits(ctx: GenContext, values: readonly [number, number, number, number]): number {
  const base = values[ctx.columnId];
  if (ctx.year === 'y4') return Math.max(3, base - 1);
  if (ctx.year === 'y6') return Math.min(6, base + 1);
  return base;
}

function fmtNum(n: number): string {
  const negative = n < 0;
  const digits = Math.abs(n).toString();
  const spaced = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return negative ? `-${spaced}` : spaced;
}

function fmtMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x;
}

function prompt(text: string, answer: string | number): PromptQuestion {
  return { kind: 'prompt', prompt: text, answer: String(answer) };
}

function wholeForFraction(
  numerator: number,
  denominator: number,
  min: number,
  max: number,
): number {
  const step = denominator / gcd(numerator, denominator);
  const minMultiple = Math.ceil(min / step);
  const maxMultiple = Math.floor(max / step);
  const multiple = randInt(minMultiple, Math.max(minMultiple, maxMultiple));
  return multiple * step;
}

function buildNumber(digits: number): number {
  let value = randInt(1, 9);
  for (let i = 1; i < digits; i += 1) {
    value = value * 10 + randInt(0, 9);
  }
  return value;
}

function integerAverageTriple(min: number, max: number): [number, number, number] {
  const average = randInt(min, max);
  const total = average * 3;
  const a = randInt(Math.max(min, total - max * 2), Math.min(max, total - min * 2));
  const remaining = total - a;
  const b = randInt(Math.max(min, remaining - max), Math.min(max, remaining - min));
  return [a, b, remaining - b];
}

function expandedNotation(value: number): string {
  const units = [100000, 10000, 1000, 100, 10, 1];
  const parts: number[] = [];
  let remaining = value;

  for (const unit of units) {
    const count = Math.floor(remaining / unit);
    if (count > 0) {
      parts.push(count * unit);
      remaining -= count * unit;
    }
  }

  return parts.map(fmtNum).join(' + ');
}

function additionPair(ctx: GenContext): [number, number] {
  if (ctx.columnId === 0) {
    if (randInt(0, 1) === 0) {
      return [randInt(3, 9), randInt(2, 9)];
    }
    const b = scaleValue(randInt(10, 18), ctx.year);
    return [randInt(4, 9), Math.max(10, b)];
  }
  if (ctx.columnId === 1) {
    return [colRange(ctx, [18, 18, 18, 18], [65, 65, 65, 65]), colRange(ctx, [12, 12, 12, 12], [45, 45, 45, 45])];
  }
  if (ctx.columnId === 2) {
    return [colRange(ctx, [55, 55, 55, 55], [180, 180, 180, 180]), colRange(ctx, [30, 30, 30, 30], [120, 120, 120, 120])];
  }
  return [colRange(ctx, [120, 120, 120, 120], [450, 450, 450, 450]), colRange(ctx, [70, 70, 70, 70], [280, 280, 280, 280])];
}

function subtractionPair(ctx: GenContext): [number, number] {
  if (ctx.columnId === 0) {
    const b = randInt(2, 9);
    const a = b + randInt(4, 18);
    return [a, b];
  }
  if (ctx.columnId === 1) {
    const b = colRange(ctx, [12, 12, 12, 12], [45, 45, 45, 45]);
    return [b + colRange(ctx, [15, 15, 15, 15], [55, 55, 55, 55]), b];
  }
  if (ctx.columnId === 2) {
    const b = colRange(ctx, [35, 35, 35, 35], [95, 95, 95, 95]);
    return [b + colRange(ctx, [40, 40, 40, 40], [140, 140, 140, 140]), b];
  }
  const b = colRange(ctx, [80, 80, 80, 80], [220, 220, 220, 220]);
  return [b + colRange(ctx, [90, 90, 90, 90], [320, 320, 320, 320]), b];
}

function slot01Addition(ctx: GenContext): PromptQuestion {
  const [a, b] = additionPair(ctx);
  if (variant(ctx) === 0) {
    return prompt(`${fmtNum(a)} and ${fmtNum(b)} more`, a + b);
  }
  return prompt(`To ${fmtNum(a)} add ${fmtNum(b)}`, a + b);
}

function slot02Subtraction(ctx: GenContext): PromptQuestion {
  const [a, b] = subtractionPair(ctx);
  if (variant(ctx) === 0) {
    return prompt(`${fmtNum(b)} less than ${fmtNum(a)}`, a - b);
  }
  return prompt(`From ${fmtNum(a)} take ${fmtNum(b)}`, a - b);
}

function slot03Multiplication(ctx: GenContext): PromptQuestion {
  const maxTable = colPick(ctx, [5, 9, 12, 12]);
  const a = randInt(2, maxTable);
  const b =
    variant(ctx) === 1 && ctx.columnId >= 2
      ? colPick(ctx, [10, 10, 10, 100])
      : randInt(2, maxTable);
  if (variant(ctx) === 0) {
    return prompt(`${fmtNum(a)} multiplied by ${fmtNum(b)}`, a * b);
  }
  return prompt(`${fmtNum(a)} times ${fmtNum(b)}`, a * b);
}

function slot04Division(ctx: GenContext): PromptQuestion {
  const divisor = randInt(2, colPick(ctx, [5, 9, 12, 12]));
  const quotient =
    variant(ctx) === 1 && ctx.columnId >= 2
      ? colPick(ctx, [10, 10, 10, 100])
      : randInt(2, colPick(ctx, [6, 10, 14, 20]));
  const dividend = divisor * quotient;
  if (variant(ctx) === 0) {
    return prompt(`How many ${divisor}s in ${fmtNum(dividend)}?`, quotient);
  }
  return prompt(`${fmtNum(dividend)} ÷ ${divisor}`, quotient);
}

function slot05Money(ctx: GenContext): PromptQuestion {
  if (variant(ctx) === 0) {
    const evenCents = randInt(
      colPick(ctx, [10, 25, 50, 80]),
      colPick(ctx, [40, 90, 150, 220]),
    ) * 2;
    const amount = evenCents / 100;
    return prompt(`Halve ${fmtMoney(amount)}`, fmtMoney(amount / 2));
  }

  const count = ctx.columnId === 0 ? 2 : 3;
  const parts = Array.from({ length: count }, () =>
    randInt(colPick(ctx, [50, 100, 150, 200]), colPick(ctx, [180, 300, 450, 600])) / 100,
  );
  const total = parts.reduce((sum, part) => sum + part, 0);
  return prompt(parts.map((part) => fmtMoney(part)).join(' + '), fmtMoney(total));
}

function slot06PlaceValue(ctx: GenContext): PromptQuestion {
  const digits = colDigits(ctx, [3, 4, 5, 6]);
  const value = buildNumber(digits);

  if (variant(ctx) === 0) {
    const tens = Math.floor((value % 100) / 10);
    return prompt(`Tens in ${fmtNum(value)}`, tens);
  }

  return prompt(`Expanded notation for ${fmtNum(value)}`, expandedNotation(value));
}

function slot07Decimal(ctx: GenContext): PromptQuestion {
  if (variant(ctx) === 0) {
    const numerator = randInt(1, colPick(ctx, [5, 9, 9, 9]));
    return prompt(`0.${numerator} as a fraction`, `${numerator}/10`);
  }

  const hundredths = randInt(colPick(ctx, [10, 20, 30, 40]), colPick(ctx, [50, 75, 90, 99]));
  return prompt(`0.${hundredths} as a percentage`, `${hundredths}%`);
}

function slot08Comparison(ctx: GenContext): PromptQuestion {
  const digits = colDigits(ctx, [3, 4, 5, 6]);
  let a = buildNumber(digits);
  let b = buildNumber(digits);
  if (a === b) b += randInt(1, Math.max(1, 10 ** (digits - 1)));
  return prompt(`Is ${fmtNum(a)} > ${fmtNum(b)}?`, a > b ? 'Yes' : 'No');
}

function slot09Fraction(ctx: GenContext): PromptQuestion {
  if (variant(ctx) === 0) {
    const whole = randInt(1, colPick(ctx, [3, 5, 7, 9]));
    const denominator = [2, 3, 4, 5, 8][randInt(0, ctx.columnId === 0 ? 2 : 4)];
    const numerator = randInt(1, denominator - 1);
    const improper = whole * denominator + numerator;
    return prompt(`${whole} ${numerator}/${denominator} as an improper fraction`, `${improper}/${denominator}`);
  }

  const denominator = [2, 4, 5, 10][randInt(0, 3)];
  const numerator = randInt(1, denominator - 1);
  const factor = gcd(numerator, denominator);
  return prompt(
    `${numerator}/${denominator} = □/${denominator / factor}`,
    numerator / factor,
  );
}

function slot10Portion(ctx: GenContext): PromptQuestion {
  if (variant(ctx) === 0) {
    const denominator = [2, 3, 4, 5, 8, 10][randInt(0, ctx.columnId === 0 ? 3 : 5)];
    const numerator = randInt(1, denominator - 1);
    const whole = wholeForFraction(
      numerator,
      denominator,
      colPick(ctx, [10, 20, 30, 50]),
      colPick(ctx, [30, 50, 80, 120]),
    );
    return prompt(`${numerator}/${denominator} of ${fmtNum(whole)}`, (whole * numerator) / denominator);
  }

  const percent = [10, 20, 25, 50][randInt(0, 3)];
  const amountStep = 100 / gcd(percent, 100);
  const amount =
    randInt(
      Math.ceil(colPick(ctx, [20, 40, 80, 150]) / amountStep),
      Math.floor(colPick(ctx, [60, 120, 250, 500]) / amountStep),
    ) * amountStep;
  return prompt(`${percent}% of ${fmtMoney(amount)}`, fmtMoney((amount * percent) / 100));
}

function slot11RelativeNumber(ctx: GenContext): PromptQuestion {
  const base = colRange(ctx, [120, 350, 1200, 8000], [575, 1200, 8000, 45000]);
  const step = colPick(ctx, [10, 100, 500, 1000]);
  if (variant(ctx) === 0) {
    return prompt(`Number ${fmtNum(step)} before ${fmtNum(base)}`, fmtNum(base - step));
  }
  return prompt(`Number ${fmtNum(step)} after ${fmtNum(base)}`, fmtNum(base + step));
}

function slot12Properties(ctx: GenContext): PromptQuestion {
  if (variant(ctx) === 0) {
    const [a, b, c] = integerAverageTriple(
      colPick(ctx, [4, 8, 12, 18]),
      colPick(ctx, [12, 20, 30, 45]),
    );
    return prompt(
      `Average of ${[a, b, c].map((value) => fmtNum(value)).join(', ')}`,
      (a + b + c) / 3,
    );
  }

  const targets = FACTOR_TARGETS[ctx.columnId] ?? FACTOR_TARGETS[2];
  const target = targets[randInt(0, targets.length - 1)];
  let count = 0;
  for (let i = 1; i <= target; i += 1) {
    if (target % i === 0) count += 1;
  }
  return prompt(`How many factors does ${target} have?`, count);
}

function slot13Powers(ctx: GenContext): PromptQuestion {
  if (variant(ctx) === 0 || ctx.columnId <= 1) {
    const base = randInt(2, colPick(ctx, [5, 8, 10, 12]));
    return prompt(`${base} squared`, base * base);
  }

  const base = randInt(2, colPick(ctx, [3, 4, 5, 8]));
  return prompt(`${base} cubed`, base * base * base);
}

function slot14OrderOfOperations(ctx: GenContext): PromptQuestion {
  if (variant(ctx) === 0) {
    const a = randInt(2, colPick(ctx, [4, 7, 10, 12]));
    const b = randInt(2, colPick(ctx, [4, 7, 10, 12]));
    const c = randInt(2, colPick(ctx, [3, 5, 7, 9]));
    const d = randInt(2, colPick(ctx, [2, 3, 5, 6]));
    const product = c * d;
    return prompt(`${a} × ${b} + ${product} ÷ ${d}`, a * b + c);
  }

  const a = randInt(2, colPick(ctx, [4, 6, 9, 12]));
  const b = randInt(2, colPick(ctx, [4, 6, 9, 12]));
  const c = randInt(4, colPick(ctx, [6, 7, 8, 10]));
  const d = randInt(1, colPick(ctx, [2, 3, 4, 5]));
  return prompt(`(${a} + ${b}) × (${c} − ${d})`, (a + b) * (c - d));
}

function slot15Length(ctx: GenContext): PromptQuestion {
  if (variant(ctx) === 0) {
    const km = randInt(colPick(ctx, [1, 2, 3, 5]), colPick(ctx, [3, 6, 12, 20]));
    const partial = ctx.columnId >= 3 && randInt(0, 1) === 1 ? 0.5 : 0;
    const value = km + partial;
    return prompt(`Metres in ${value} km`, value * 1000);
  }

  const hundreds = randInt(colPick(ctx, [2, 4, 8, 15]), colPick(ctx, [6, 12, 25, 45]));
  const metres = hundreds * 100;
  return prompt(`Kilometres in ${fmtNum(metres)} m`, metres / 1000);
}

function slot16Perimeter(ctx: GenContext): PromptQuestion {
  if (variant(ctx) === 0) {
    const side = colRange(ctx, [3, 5, 8, 12], [8, 12, 20, 30]);
    return prompt(`Perimeter of a square with ${side} m sides`, side * 4);
  }

  const sides = ctx.columnId === 0 ? 3 : [5, 6, 8][randInt(0, 2)];
  const side = colRange(ctx, [2, 4, 5, 8], [6, 8, 12, 18]);
  const shape = sides === 3 ? 'triangle' : sides === 5 ? 'pentagon' : sides === 6 ? 'hexagon' : 'octagon';
  return prompt(`Perimeter of a regular ${shape} with ${side} cm sides`, side * sides);
}

function slot17Volume(ctx: GenContext): PromptQuestion {
  if (variant(ctx) === 0) {
    const litres = randInt(colPick(ctx, [1, 2, 3, 5]), colPick(ctx, [4, 8, 15, 25]));
    const ml = randInt(0, 1) === 1 ? 500 : 0;
    return prompt(`Millilitres in ${litres + ml / 1000} L`, litres * 1000 + ml);
  }

  const ml = randInt(colPick(ctx, [2, 4, 8, 15]), colPick(ctx, [8, 15, 30, 50])) * 100;
  return prompt(`Litres in ${fmtNum(ml)} mL`, ml / 1000);
}

function slot18Mass(ctx: GenContext): PromptQuestion {
  if (variant(ctx) === 0) {
    const kg = randInt(colPick(ctx, [1, 2, 4, 8]), colPick(ctx, [6, 10, 16, 24]));
    const grams = randInt(0, 1) === 1 ? 500 : 0;
    return prompt(`Grams in ${kg + grams / 1000} kg`, kg * 1000 + grams);
  }

  if (ctx.columnId >= 3 && ctx.year === 'y6') {
    const tonnes = randInt(2, 12);
    return prompt(`Kilograms in ${tonnes} t`, tonnes * 1000);
  }

  const grams = randInt(colPick(ctx, [2, 4, 8, 12]), colPick(ctx, [8, 15, 25, 40])) * 100;
  return prompt(`Kilograms in ${fmtNum(grams)} g`, grams / 1000);
}

function slot19Time(ctx: GenContext): PromptQuestion {
  if (variant(ctx) === 0) {
    const targetHour = randInt(2, 12);
    const minsTo = [5, 10, 15, 16, 20, 30][randInt(0, ctx.columnId === 0 ? 2 : 5)];
    const minute = 60 - minsTo;
    const hour = targetHour - 1;
    return prompt(
      `${minsTo} to ${targetHour}`,
      `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    );
  }

  const hour = randInt(0, 23);
  const minute = randInt(0, 59);
  const digital = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const suffix = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return prompt(
    `${digital} in 12-hour time`,
    `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`,
  );
}

function slot20Geometry(ctx: GenContext): PromptQuestion {
  if (variant(ctx) === 0) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
    const index = randInt(0, directions.length - 1);
    return prompt(`Direction opposite ${directions[index]}`, directions[(index + 4) % directions.length]);
  }

  const isObtuse = randInt(0, 1) === 1;
  const angle = isObtuse
    ? randInt(91, colPick(ctx, [110, 120, 135, 150]))
    : randInt(colPick(ctx, [30, 35, 40, 45]), colPick(ctx, [75, 80, 85, 89]));
  return prompt(`Is an angle of ${angle}° obtuse?`, isObtuse ? 'Yes' : 'No');
}

const SLOTS = [
  slot01Addition,
  slot02Subtraction,
  slot03Multiplication,
  slot04Division,
  slot05Money,
  slot06PlaceValue,
  slot07Decimal,
  slot08Comparison,
  slot09Fraction,
  slot10Portion,
  slot11RelativeNumber,
  slot12Properties,
  slot13Powers,
  slot14OrderOfOperations,
  slot15Length,
  slot16Perimeter,
  slot17Volume,
  slot18Mass,
  slot19Time,
  slot20Geometry,
];

export function generateMentalSet(year: YearLevel, columnId: number): PromptQuestion[] {
  const ctx: GenContext = { year, columnId };
  return SLOTS.map((slot) => slot(ctx));
}
