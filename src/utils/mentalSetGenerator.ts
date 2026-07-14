import type { PromptQuestion, YearLevel } from '../types';

type GenContext = {
  year: YearLevel;
  columnId: number;
};

type Tier4<T> = readonly [T, T, T, T];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(values: readonly T[]): T {
  return values[randInt(0, values.length - 1)];
}

function coin(): boolean {
  return randInt(0, 1) === 0;
}

function yearFactor(year: YearLevel): number {
  return { y4: 0.85, y5: 1, y6: 1.12 }[year];
}

function scaleValue(value: number, year: YearLevel): number {
  return Math.max(1, Math.round(value * yearFactor(year)));
}

function colPick(ctx: GenContext, values: Tier4<number>): number {
  return scaleValue(values[ctx.columnId] ?? values[2], ctx.year);
}

function colRange(ctx: GenContext, mins: Tier4<number>, maxs: Tier4<number>): number {
  const min = scaleValue(mins[ctx.columnId], ctx.year);
  const max = scaleValue(maxs[ctx.columnId], ctx.year);
  return randInt(min, Math.max(min, max));
}

function colDigits(ctx: GenContext, values: Tier4<number>): number {
  const base = values[ctx.columnId];
  if (ctx.year === 'y4') return Math.max(2, base - 1);
  if (ctx.year === 'y6') return Math.min(6, base + 1);
  return base;
}

function tierOf<T>(ctx: GenContext, values: Tier4<T>): T {
  return values[ctx.columnId] ?? values[2];
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

function coprimeNumerator(denominator: number): number {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const n = randInt(1, denominator - 1);
    if (gcd(n, denominator) === 1) return n;
  }
  return 1;
}

function additionPair(ctx: GenContext): [number, number] {
  if (ctx.columnId === 0) {
    if (coin()) return [randInt(3, 9), randInt(2, 9)];
    return [randInt(4, 9), colRange(ctx, [10, 10, 10, 10], [18, 18, 18, 18])];
  }
  if (ctx.columnId === 1) {
    return [
      colRange(ctx, [18, 18, 18, 18], [55, 55, 55, 55]),
      colRange(ctx, [12, 12, 12, 12], [40, 40, 40, 40]),
    ];
  }
  if (ctx.columnId === 2) {
    return [
      colRange(ctx, [55, 55, 55, 55], [160, 160, 160, 160]),
      colRange(ctx, [30, 30, 30, 30], [99, 99, 99, 99]),
    ];
  }
  return [
    colRange(ctx, [120, 120, 120, 120], [450, 450, 450, 450]),
    colRange(ctx, [70, 70, 70, 70], [280, 280, 280, 280]),
  ];
}

function subtractionPair(ctx: GenContext): [number, number] {
  if (ctx.columnId === 0) {
    const b = randInt(2, 9);
    return [b + randInt(4, 18), b];
  }
  if (ctx.columnId === 1) {
    const b = colRange(ctx, [12, 12, 12, 12], [40, 40, 40, 40]);
    return [b + colRange(ctx, [15, 15, 15, 15], [45, 45, 45, 45]), b];
  }
  if (ctx.columnId === 2) {
    const b = colRange(ctx, [35, 35, 35, 35], [90, 90, 90, 90]);
    return [b + colRange(ctx, [40, 40, 40, 40], [130, 130, 130, 130]), b];
  }
  const b = colRange(ctx, [80, 80, 80, 80], [220, 220, 220, 220]);
  return [b + colRange(ctx, [90, 90, 90, 90], [300, 300, 300, 300]), b];
}

/** Q1 — number size climbs Starters → Legends; wording is variety only. */
function slot01Addition(ctx: GenContext): PromptQuestion {
  const [a, b] = additionPair(ctx);
  if (coin()) return prompt(`${fmtNum(a)} and ${fmtNum(b)} more`, a + b);
  return prompt(`To ${fmtNum(a)} add ${fmtNum(b)}`, a + b);
}

/** Q2 — same number climb as addition. */
function slot02Subtraction(ctx: GenContext): PromptQuestion {
  const [a, b] = subtractionPair(ctx);
  if (coin()) return prompt(`${fmtNum(b)} less than ${fmtNum(a)}`, a - b);
  return prompt(`From ${fmtNum(a)} take ${fmtNum(b)}`, a - b);
}

/** Q3 — table ceiling rises; ×10 / ×100 only at upper tiers. */
function slot03Multiplication(ctx: GenContext): PromptQuestion {
  const maxTable = colPick(ctx, [5, 9, 12, 12]);
  const a = randInt(2, maxTable);
  let b = randInt(2, maxTable);

  if (ctx.columnId === 2 && coin()) b = 10;
  if (ctx.columnId === 3) b = ctx.year === 'y6' && coin() ? 100 : pick([10, 100]);

  if (coin()) return prompt(`${fmtNum(a)} multiplied by ${fmtNum(b)}`, a * b);
  return prompt(`${fmtNum(a)} times ${fmtNum(b)}`, a * b);
}

/** Q4 — tracks multiplication: larger quotients / neat ÷10÷100 later. */
function slot04Division(ctx: GenContext): PromptQuestion {
  const maxDivisor = colPick(ctx, [5, 9, 12, 12]);
  let divisor = randInt(2, maxDivisor);
  let quotient = randInt(2, colPick(ctx, [6, 10, 12, 20]));

  if (ctx.columnId === 2 && coin()) {
    quotient = 10;
    divisor = randInt(2, maxDivisor);
  }
  if (ctx.columnId === 3) {
    quotient = ctx.year === 'y6' && coin() ? 100 : pick([10, 100]);
    divisor = randInt(2, Math.min(12, maxDivisor));
  }

  const dividend = divisor * quotient;
  if (coin()) return prompt(`How many ${divisor}s in ${fmtNum(dividend)}?`, quotient);
  return prompt(`${fmtNum(dividend)} ÷ ${divisor}`, quotient);
}

/** Q5 — Starters: halve; Rising: add 2; Champions: either harder; Legends: add 3 / hard half. */
function slot05Money(ctx: GenContext): PromptQuestion {
  const useHalve =
    ctx.columnId === 0 ||
    (ctx.columnId === 2 && coin()) ||
    (ctx.columnId === 3 && coin() && ctx.year !== 'y4');

  if (useHalve) {
    const evenCents =
      randInt(colPick(ctx, [10, 25, 50, 90]), colPick(ctx, [40, 80, 140, 220])) * 2;
    const amount = evenCents / 100;
    return prompt(`Halve ${fmtMoney(amount)}`, fmtMoney(amount / 2));
  }

  const count = ctx.columnId >= 3 ? 3 : 2;
  const parts = Array.from({ length: count }, () =>
    randInt(colPick(ctx, [50, 90, 140, 200]), colPick(ctx, [160, 280, 420, 600])) / 100,
  );
  const total = parts.reduce((sum, part) => sum + part, 0);
  return prompt(parts.map((part) => fmtMoney(part)).join(' + '), fmtMoney(total));
}

/** Q6 — tens → hundreds → expanded (short) → expanded (long). */
function slot06PlaceValue(ctx: GenContext): PromptQuestion {
  const digits = colDigits(ctx, [3, 4, 5, 6]);
  const value = buildNumber(digits);

  if (ctx.columnId === 0) {
    const tens = Math.floor((value % 100) / 10);
    return prompt(`Tens in ${fmtNum(value)}`, tens);
  }
  if (ctx.columnId === 1) {
    const hundreds = Math.floor((value % 1000) / 100);
    return prompt(`Hundreds in ${fmtNum(value)}`, hundreds);
  }
  return prompt(`Expanded notation for ${fmtNum(value)}`, expandedNotation(value));
}

/** Q7 — tenths as fraction → tenths as % → hundredths as % → hundredths as fraction. */
function slot07Decimal(ctx: GenContext): PromptQuestion {
  if (ctx.columnId === 0) {
    const numerator = randInt(1, Math.min(9, colPick(ctx, [5, 7, 9, 9])));
    return prompt(`0.${numerator} as a fraction`, `${numerator}/10`);
  }

  if (ctx.columnId === 1) {
    const numerator = randInt(1, 9);
    return prompt(`0.${numerator} as a percentage`, `${numerator * 10}%`);
  }

  const hundredths = randInt(
    Math.min(99, colPick(ctx, [10, 15, 25, 35])),
    Math.min(99, colPick(ctx, [40, 60, 85, 99])),
  );

  if (ctx.columnId === 2) {
    return prompt(`0.${String(hundredths).padStart(2, '0')} as a percentage`, `${hundredths}%`);
  }

  const g = gcd(hundredths, 100);
  return prompt(
    `0.${String(hundredths).padStart(2, '0')} as a fraction`,
    `${hundredths / g}/${100 / g}`,
  );
}

/** Q8 — digit length climbs; top tiers prefer near comparisons. */
function slot08Comparison(ctx: GenContext): PromptQuestion {
  const digits = colDigits(ctx, [3, 4, 5, 6]);
  let a = buildNumber(digits);
  let b: number;

  if (ctx.columnId >= 2 && coin()) {
    const delta = randInt(1, Math.max(3, 10 ** (digits - 2)));
    b = coin() ? a + delta : Math.max(1, a - delta);
  } else {
    b = buildNumber(digits);
    if (a === b) b += randInt(1, Math.max(1, 10 ** (digits - 1)));
  }

  return prompt(`Is ${fmtNum(a)} > ${fmtNum(b)}?`, a > b ? 'Yes' : 'No');
}

/**
 * Q9 — equivalent fractions first (easy dens), then mixed→improper,
 * then harder equivalents, then harder mixed / tougher dens.
 * Reduced form is chosen first so dens never collapse to identical sides.
 */
function slot09Fraction(ctx: GenContext): PromptQuestion {
  const doMixed = ctx.columnId === 1 || (ctx.columnId === 3 && coin());

  if (doMixed) {
    const whole = randInt(1, colPick(ctx, [2, 3, 5, 7]));
    const dens = tierOf(ctx, [
      [2, 3, 4],
      [2, 3, 4, 5],
      [3, 4, 5, 6, 8],
      [4, 5, 6, 8, 10],
    ] as const);
    const denominator = pick(dens);
    const numerator = randInt(1, denominator - 1);
    const improper = whole * denominator + numerator;
    return prompt(
      `${whole} ${numerator}/${denominator} as an improper fraction`,
      `${improper}/${denominator}`,
    );
  }

  const dens = tierOf(ctx, [
    [2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6, 8],
    [4, 5, 6, 8, 10, 12],
  ] as const);
  const scales = tierOf(ctx, [
    [2],
    [2, 3],
    [2, 3, 4],
    [3, 4, 5],
  ] as const);
  const d = pick(dens);
  const n = coprimeNumerator(d);
  const scale = pick(scales);
  return prompt(`${n * scale}/${d * scale} = □/${d}`, n);
}

/** Q10 — fraction-of first, percentages later; amounts climb. */
function slot10Portion(ctx: GenContext): PromptQuestion {
  const usePercent = ctx.columnId >= 2;

  if (!usePercent) {
    const dens = tierOf(ctx, [
      [2, 3, 4, 5],
      [2, 3, 4, 5, 8],
      [2, 3, 4, 5, 8, 10],
      [3, 4, 5, 8, 10],
    ] as const);
    const denominator = pick(dens);
    const numerator =
      ctx.columnId === 0 ? pick([1, Math.max(1, Math.floor(denominator / 2))]) : randInt(1, denominator - 1);
    const whole = wholeForFraction(
      numerator,
      denominator,
      colPick(ctx, [12, 20, 30, 48]),
      colPick(ctx, [28, 48, 72, 120]),
    );
    return prompt(`${numerator}/${denominator} of ${fmtNum(whole)}`, (whole * numerator) / denominator);
  }

  const percents = tierOf(ctx, [
    [10, 50],
    [10, 20, 50],
    [10, 20, 25, 50],
    [10, 20, 25, 40, 50],
  ] as const);
  const percent = pick(percents);
  const amountStep = 100 / gcd(percent, 100);
  const lo = Math.ceil(colPick(ctx, [20, 40, 80, 120]) / amountStep);
  const hi = Math.floor(colPick(ctx, [60, 120, 240, 480]) / amountStep);
  const amount = randInt(lo, Math.max(lo, hi)) * amountStep;
  return prompt(`${percent}% of ${fmtMoney(amount)}`, fmtMoney((amount * percent) / 100));
}

/** Q11 — place-value steps grow with tier. */
function slot11RelativeNumber(ctx: GenContext): PromptQuestion {
  const base = colRange(ctx, [120, 350, 1200, 8000], [575, 1200, 8000, 45000]);
  const step = colPick(ctx, [10, 100, 500, 1000]);
  if (coin()) return prompt(`Number ${fmtNum(step)} before ${fmtNum(base)}`, fmtNum(base - step));
  return prompt(`Number ${fmtNum(step)} after ${fmtNum(base)}`, fmtNum(base + step));
}

/** Q12 — averages on lower tiers; factor counts unlock mid→top. */
function slot12Properties(ctx: GenContext): PromptQuestion {
  const useFactors = ctx.columnId >= 2;

  if (!useFactors) {
    const [a, b, c] = integerAverageTriple(
      colPick(ctx, [4, 8, 12, 16]),
      colPick(ctx, [12, 20, 28, 40]),
    );
    return prompt(
      `Average of ${[a, b, c].map((value) => fmtNum(value)).join(', ')}`,
      (a + b + c) / 3,
    );
  }

  const targets = tierOf(ctx, [
    [12, 18, 24],
    [18, 24, 30],
    [24, 30, 36, 42],
    [36, 48, 60, 72],
  ] as const);
  const target = pick(targets);
  let count = 0;
  for (let i = 1; i <= target; i += 1) {
    if (target % i === 0) count += 1;
  }
  return prompt(`How many factors does ${target} have?`, count);
}

/** Q13 — squares first; cubes only Champions+ (and Year 5+). */
function slot13Powers(ctx: GenContext): PromptQuestion {
  const allowCube = ctx.columnId >= 2 && ctx.year !== 'y4';

  if (!allowCube || (ctx.columnId === 2 && coin())) {
    const base = randInt(2, colPick(ctx, [5, 8, 10, 12]));
    return prompt(`${base} squared`, base * base);
  }

  const base = randInt(2, colPick(ctx, [3, 3, 4, 6]));
  return prompt(`${base} cubed`, base * base * base);
}

/** Q14 — multiply/add → with division → brackets → harder brackets. */
function slot14OrderOfOperations(ctx: GenContext): PromptQuestion {
  if (ctx.columnId === 0) {
    const a = randInt(2, colPick(ctx, [4, 5, 6, 6]));
    const b = randInt(2, colPick(ctx, [4, 5, 6, 6]));
    const c = randInt(2, colPick(ctx, [3, 5, 7, 8]));
    return prompt(`${a} × ${b} + ${c}`, a * b + c);
  }

  if (ctx.columnId === 1) {
    const a = randInt(2, colPick(ctx, [4, 6, 8, 9]));
    const b = randInt(2, colPick(ctx, [4, 6, 8, 9]));
    const d = randInt(2, colPick(ctx, [2, 3, 4, 5]));
    const c = randInt(2, colPick(ctx, [3, 4, 5, 6]));
    const product = c * d;
    return prompt(`${a} × ${b} + ${product} ÷ ${d}`, a * b + c);
  }

  const a = randInt(2, colPick(ctx, [4, 5, 8, 10]));
  const b = randInt(2, colPick(ctx, [4, 5, 8, 10]));
  const c = randInt(4, colPick(ctx, [6, 7, 9, 12]));
  const d = randInt(1, colPick(ctx, [2, 3, 4, 5]));
  return prompt(`(${a} + ${b}) × (${c} − ${d})`, (a + b) * (c - d));
}

/** Q15 — km↔m; half kilometres only at top tier. */
function slot15Length(ctx: GenContext): PromptQuestion {
  const toMetres =
    ctx.columnId <= 1 || ctx.columnId === 3 || (ctx.columnId === 2 && coin());

  if (toMetres) {
    const km = randInt(colPick(ctx, [1, 2, 3, 5]), colPick(ctx, [3, 5, 10, 16]));
    const partial = ctx.columnId === 3 && coin() ? 0.5 : 0;
    const value = km + partial;
    return prompt(`Metres in ${value} km`, value * 1000);
  }

  const hundreds = randInt(colPick(ctx, [2, 4, 8, 12]), colPick(ctx, [6, 12, 24, 40]));
  const metres = hundreds * 100;
  return prompt(`Kilometres in ${fmtNum(metres)} m`, metres / 1000);
}

/** Q16 — square → triangle → pentagon/hex → larger / octagon. */
function slot16Perimeter(ctx: GenContext): PromptQuestion {
  if (ctx.columnId === 0) {
    const side = colRange(ctx, [3, 3, 3, 3], [8, 8, 8, 8]);
    return prompt(`Perimeter of a square with ${side} m sides`, side * 4);
  }
  if (ctx.columnId === 1) {
    const side = colRange(ctx, [2, 3, 3, 3], [6, 8, 8, 8]);
    return prompt(`Perimeter of a regular triangle with ${side} cm sides`, side * 3);
  }

  const sides = ctx.columnId === 2 ? pick([5, 6]) : pick([5, 6, 8]);
  const side = colRange(ctx, [2, 4, 5, 8], [6, 8, 12, 16]);
  const shape = sides === 5 ? 'pentagon' : sides === 6 ? 'hexagon' : 'octagon';
  return prompt(`Perimeter of a regular ${shape} with ${side} cm sides`, side * sides);
}

/** Q17 — L↔mL; .5 L commoner higher up. */
function slot17Volume(ctx: GenContext): PromptQuestion {
  if (ctx.columnId <= 1 || (ctx.columnId >= 2 && coin())) {
    const litres = randInt(colPick(ctx, [1, 2, 3, 5]), colPick(ctx, [4, 6, 12, 20]));
    const ml = ctx.columnId >= 2 && coin() ? 500 : 0;
    return prompt(`Millilitres in ${litres + ml / 1000} L`, litres * 1000 + ml);
  }

  const ml = randInt(colPick(ctx, [2, 4, 8, 12]), colPick(ctx, [8, 12, 25, 40])) * 100;
  return prompt(`Litres in ${fmtNum(ml)} mL`, ml / 1000);
}

/** Q18 — g↔kg; tonnes only Legends Year 6. */
function slot18Mass(ctx: GenContext): PromptQuestion {
  if (ctx.columnId === 3 && ctx.year === 'y6' && coin()) {
    const tonnes = randInt(2, 12);
    return prompt(`Kilograms in ${tonnes} t`, tonnes * 1000);
  }

  if (ctx.columnId <= 1 || coin()) {
    const kg = randInt(colPick(ctx, [1, 2, 4, 8]), colPick(ctx, [5, 8, 14, 20]));
    const grams = ctx.columnId >= 2 && coin() ? 500 : 0;
    return prompt(`Grams in ${kg + grams / 1000} kg`, kg * 1000 + grams);
  }

  const grams = randInt(colPick(ctx, [2, 4, 8, 12]), colPick(ctx, [8, 14, 24, 36])) * 100;
  return prompt(`Kilograms in ${fmtNum(grams)} g`, grams / 1000);
}

/** Q19 — "minutes to" with simpler offsets first; 24→12 hour later. */
function slot19Time(ctx: GenContext): PromptQuestion {
  if (ctx.columnId <= 1) {
    const targetHour = randInt(2, 12);
    const minsOptions = tierOf(ctx, [
      [5, 10, 15],
      [5, 10, 15, 20, 30],
      [5, 10, 15, 20, 30],
      [5, 10, 15, 20, 30],
    ] as const);
    const minsTo = pick(minsOptions);
    const minute = 60 - minsTo;
    const hour = targetHour - 1;
    return prompt(
      `${minsTo} to ${targetHour}`,
      `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    );
  }

  const hour = randInt(0, 23);
  const minute =
    ctx.columnId === 2 ? pick([0, 15, 30, 45]) : randInt(0, 59);
  const digital = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const suffix = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return prompt(
    `${digital} in 12-hour time`,
    `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`,
  );
}

/** Q20 — cardinals → intercardinals → obtuse check. */
function slot20Geometry(ctx: GenContext): PromptQuestion {
  if (ctx.columnId <= 1) {
    const directions =
      ctx.columnId === 0
        ? (['N', 'E', 'S', 'W'] as const)
        : (['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const);
    const index = randInt(0, directions.length - 1);
    const opposite = directions[(index + directions.length / 2) % directions.length];
    return prompt(`Direction opposite ${directions[index]}`, opposite);
  }

  const isObtuse = coin();
  const angle = isObtuse
    ? randInt(91, colPick(ctx, [110, 120, 135, 150]))
    : randInt(colPick(ctx, [20, 30, 35, 40]), colPick(ctx, [70, 80, 85, 89]));
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
