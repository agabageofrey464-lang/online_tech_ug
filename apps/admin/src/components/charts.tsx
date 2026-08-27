"use client";

/**
 * Small, dependency-free charts for the admin.
 *
 * Drawn as inline SVG so the dashboard stays fast (no charting library on a
 * shop that owners often open on mobile data). Every chart degrades to an
 * honest "no data yet" state rather than a misleading flat line.
 */

const BRAND = "#f15a29";
const INK = "#282363";
const GRID = "#e6e8ef";

const ugxShort = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${Math.round(n / 1_000)}K` : String(n);

/** Revenue over time — area + line with an emphasised final point. */
export function RevenueChart({
  data,
  height = 160,
}: {
  data: { date: string; revenue: number }[];
  height?: number;
}) {
  const points = data.filter((d) => Number.isFinite(d.revenue));
  if (points.length < 2) {
    return <NoData label="Not enough data yet — revenue appears once you have a few days of orders." />;
  }

  const W = 600;
  const H = height;
  const pad = { top: 10, right: 8, bottom: 22, left: 40 };
  const max = Math.max(1, ...points.map((d) => d.revenue));
  const stepX = (W - pad.left - pad.right) / (points.length - 1);
  const y = (v: number) => pad.top + (1 - v / max) * (H - pad.top - pad.bottom);
  const x = (i: number) => pad.left + i * stepX;

  const line = points.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.revenue)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${H - pad.bottom} L${x(0)},${H - pad.bottom} Z`;
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Revenue over time">
      {/* horizontal guides + value labels */}
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={pad.left} x2={W - pad.right} y1={y(max * t)} y2={y(max * t)} stroke={GRID} strokeWidth="1" />
          <text x={4} y={y(max * t) + 4} fontSize="10" fill="#8b89a6">
            {ugxShort(Math.round(max * t))}
          </text>
        </g>
      ))}
      <defs>
        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRAND} stopOpacity="0.28" />
          <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#revFill)" />
      <path d={line} fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(points.length - 1)} cy={y(last.revenue)} r="4.5" fill={BRAND} stroke="#fff" strokeWidth="2" />
      {/* first & last date only — keeps the axis readable on a phone */}
      <text x={pad.left} y={H - 6} fontSize="10" fill="#8b89a6">
        {points[0].date.slice(5)}
      </text>
      <text x={W - pad.right} y={H - 6} fontSize="10" fill="#8b89a6" textAnchor="end">
        {last.date.slice(5)}
      </text>
    </svg>
  );
}

/** Orders by status — horizontal bars, so long labels stay readable. */
export function StatusBars({ data }: { data: { label: string; value: number; tone?: string }[] }) {
  const rows = data.filter((d) => d.value > 0);
  if (rows.length === 0) return <NoData label="No orders yet." />;
  const max = Math.max(...rows.map((r) => r.value));

  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs capitalize text-ink-600/70">{r.label}</span>
          <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-100">
            <span
              className="block h-full rounded-full transition-all"
              style={{ width: `${(r.value / max) * 100}%`, backgroundColor: r.tone || INK }}
            />
          </span>
          <span className="w-8 shrink-0 text-right text-xs font-bold tabular-nums text-ink-600">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

/** Share of a total — a compact donut with the headline figure in the middle. */
export function Donut({
  value,
  total,
  label,
  color = BRAND,
}: {
  value: number;
  total: number;
  label: string;
  color?: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 110 110" className="h-24 w-24 shrink-0 -rotate-90" role="img" aria-label={label}>
        <circle cx="55" cy="55" r={r} fill="none" stroke={GRID} strokeWidth="12" />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
        />
      </svg>
      <div>
        <p className="text-2xl font-extrabold tabular-nums text-ink-600">{pct}%</p>
        <p className="text-xs text-ink-600/60">{label}</p>
      </div>
    </div>
  );
}

/** Ranked list with a proportional bar behind each row (top products, etc). */
export function RankedBars({
  data,
  format = (n: number) => String(n),
}: {
  data: { name: string; value: number }[];
  format?: (n: number) => string;
}) {
  if (data.length === 0) return <NoData label="No sales yet." />;
  const max = Math.max(...data.map((d) => d.value));
  return (
    <ol className="space-y-2">
      {data.map((d, i) => (
        <li key={d.name} className="relative overflow-hidden rounded-md bg-ink-50/70 px-3 py-2">
          <span
            className="absolute inset-y-0 left-0 bg-brand-100/70"
            style={{ width: `${(d.value / max) * 100}%` }}
          />
          <span className="relative flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-600">
                {i + 1}
              </span>
              <span className="truncate text-ink-700">{d.name}</span>
            </span>
            <span className="shrink-0 font-bold tabular-nums text-ink-600">{format(d.value)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function NoData({ label }: { label: string }) {
  return (
    <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ink-600/15 text-center">
      <svg viewBox="0 0 48 32" className="h-8 w-12" aria-hidden="true">
        <path d="M2 26 L14 14 L24 20 L34 6 L46 16" fill="none" stroke={GRID} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="px-4 text-xs text-ink-600/50">{label}</p>
    </div>
  );
}
