interface DataPoint {
  label: string;
  value: number;
}

interface ProgressChartProps {
  title: string;
  data: DataPoint[];
  unit: string;
  color: string;
  formatValue?: (v: number) => string;
  lowerIsBetter?: boolean;
}

const W = 480;
const H = 180;
const PAD = { top: 16, right: 16, bottom: 32, left: 44 };

export function ProgressChart({
  title,
  data,
  unit,
  color,
  formatValue = (v) => String(Math.round(v)),
  lowerIsBetter = false,
}: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="chart-card">
        <h3>{title}</h3>
        <div className="chart-empty">No data yet — log a few results to see progress.</div>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = rawMin === rawMax ? Math.max(rawMax * 0.1, 1) : (rawMax - rawMin) * 0.15;
  const min = Math.max(0, rawMin - padding);
  const max = rawMax + padding;
  const range = max - min || 1;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const points = data.map((d, i) => {
    const x = PAD.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
    const y = PAD.top + plotH - ((d.value - min) / range) * plotH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD.top + plotH} L ${points[0].x} ${PAD.top + plotH} Z`;

  const yTicks = [min, min + range / 2, max];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>{title}</h3>
        <span className="chart-unit">{unit}{lowerIsBetter ? ' ↓' : ''}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="progress-chart" role="img" aria-label={title}>
        {yTicks.map((tick) => {
          const y = PAD.top + plotH - ((tick - min) / range) * plotH;
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                className="chart-grid"
              />
              <text x={PAD.left - 8} y={y + 4} className="chart-axis-label" textAnchor="end">
                {formatValue(tick)}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill={color} fillOpacity={0.12} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={`${p.label}-${i}`}>
            <circle cx={p.x} cy={p.y} r={5} fill={color} />
            <text x={p.x} y={H - 8} className="chart-x-label" textAnchor="middle">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
