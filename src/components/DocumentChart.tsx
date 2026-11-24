import React, { useMemo, useState } from 'react';
import { BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon, Table as TableIcon } from 'lucide-react';
import { ExamChartData, ExamChartSeries } from '../types/exam';

interface DocumentChartProps {
  chartData: ExamChartData;
  compact?: boolean;
  className?: string;
}

const SERIES_PALETTE = [
  '#059669', // emerald-600
  '#0284c7', // sky-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#e11d48', // rose-600
  '#0d9488', // teal-600
  '#475569', // slate-600
  '#ea580c', // orange-600
];

function formatChartNumber(val: number | null | undefined, display?: string): string {
  if (display && display.trim().length > 0) return display.trim();
  if (val === null || val === undefined || !Number.isFinite(val)) return '—';
  if (Number.isInteger(val)) return String(val);
  return String(Number(val.toFixed(4))).replace('.', ',');
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describePieSlice(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const span = Math.min(359.99, Math.max(0.01, endAngle - startAngle));
  const start = polarToCartesian(cx, cy, r, startAngle + span);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = span > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${end.x.toFixed(2)} ${end.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${start.x.toFixed(2)} ${start.y.toFixed(2)} Z`;
}

/**
 * Hiển thị nguyên bản mọi loại biểu đồ trong tài liệu (cột ngang, cột dọc/nhóm nhiều chuỗi,
 * biểu đồ đường/miền, biểu đồ tròn) — giữ nguyên 100% nhãn, tên chuỗi, số liệu và đơn vị gốc.
 */
export const DocumentChart: React.FC<DocumentChartProps> = ({
  chartData,
  compact = false,
  className = '',
}) => {
  const [showRawDataTable, setShowRawDataTable] = useState(false);

  const normalized = useMemo(() => {
    const unit = (chartData.unit || '').trim();
    const categories: string[] =
      Array.isArray(chartData.categories) && chartData.categories.length > 0
        ? chartData.categories.map((c) => String(c ?? ''))
        : Array.isArray(chartData.items)
        ? chartData.items.map((it) => String(it.label ?? ''))
        : [];

    const series: ExamChartSeries[] =
      Array.isArray(chartData.series) && chartData.series.length > 0
        ? chartData.series.map((s, idx) => ({
            name: String(s.name || `Chuỗi ${idx + 1}`),
            values: Array.isArray(s.values) ? s.values : [],
            displayValues: Array.isArray(s.displayValues) ? s.displayValues : undefined,
            color: s.color || SERIES_PALETTE[idx % SERIES_PALETTE.length],
          }))
        : Array.isArray(chartData.items) && chartData.items.length > 0
        ? [
            {
              name: unit ? `Giá trị (${unit})` : 'Giá trị',
              values: chartData.items.map((it) => (Number.isFinite(it.value) ? it.value : 0)),
              displayValues: chartData.items.map((it) =>
                it.displayValue !== undefined ? String(it.displayValue) : formatChartNumber(it.value)
              ),
              color: SERIES_PALETTE[0],
            },
          ]
        : [];

    const allNumbers: number[] = [];
    series.forEach((s) =>
      s.values.forEach((v) => {
        if (typeof v === 'number' && Number.isFinite(v)) allNumbers.push(v);
      })
    );
    const maxVal = allNumbers.length > 0 ? Math.max(...allNumbers, 0) : 1;
    const minVal = allNumbers.length > 0 ? Math.min(...allNumbers, 0) : 0;

    return {
      unit,
      categories,
      series,
      maxVal: maxVal === minVal ? maxVal + 1 : maxVal,
      minVal: Math.min(0, minVal),
      isMultiSeries: series.length > 1,
    };
  }, [chartData]);

  const hasData = normalized.categories.length > 0 && normalized.series.length > 0;
  if (!hasData) return null;

  const isHorizontalSingleBar =
    chartData.type === 'bar' && !normalized.isMultiSeries && Array.isArray(chartData.items) && chartData.items.length > 0;

  const HeaderIcon =
    chartData.type === 'pie'
      ? PieChartIcon
      : chartData.type === 'line' || chartData.type === 'area'
      ? LineChartIcon
      : BarChart2;

  const renderRawDataTable = () => (
    <div className="mt-2.5 overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-[11px] sm:text-xs text-slate-800">
        <thead>
          <tr className="bg-slate-100 text-slate-900 font-bold">
            <th className="py-1.5 px-2.5 border border-slate-200 text-left">Danh mục / Trục ngang</th>
            {normalized.series.map((s, sIdx) => (
              <th key={sIdx} className="py-1.5 px-2.5 border border-slate-200 text-center">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-xs inline-block shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>{s.name}</span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {normalized.categories.map((cat, cIdx) => (
            <tr key={cIdx} className={cIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
              <td className="py-1.5 px-2.5 border border-slate-200 font-semibold text-slate-800">
                {cat}
              </td>
              {normalized.series.map((s, sIdx) => (
                <td
                  key={sIdx}
                  className="py-1.5 px-2.5 border border-slate-200 text-center font-mono tabular-nums"
                >
                  {formatChartNumber(s.values[cIdx], s.displayValues?.[cIdx])}
                  {normalized.unit ? ` ${normalized.unit}` : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGroupedColumnSvg = () => {
    const catCount = normalized.categories.length;
    const serCount = normalized.series.length;
    const svgWidth = Math.max(460, catCount * Math.max(76, serCount * 30 + 26) + 74);
    const svgHeight = compact ? 225 : 265;
    const padLeft = 52;
    const padRight = 20;
    const padTop = 24;
    const padBottom = 56;
    const plotW = svgWidth - padLeft - padRight;
    const plotH = svgHeight - padTop - padBottom;

    const range = Math.max(normalized.maxVal - normalized.minVal, 0.001);
    const yMax = normalized.maxVal + range * 0.14;
    const yMin = normalized.minVal;
    const ySpan = Math.max(yMax - yMin, 0.001);
    const valueToY = (v: number) => padTop + plotH - ((v - yMin) / ySpan) * plotH;
    const zeroY = valueToY(0);

    const gridSteps = 4;
    const ticks = Array.from({ length: gridSteps + 1 }, (_, i) => yMin + (ySpan * i) / gridSteps);
    const groupW = plotW / catCount;
    const innerGroupW = Math.min(groupW * 0.74, serCount * 36);
    const barGap = serCount > 1 ? 4 : 0;
    const barW = Math.max(10, (innerGroupW - barGap * (serCount - 1)) / serCount);

    return (
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto block"
          style={{ minWidth: catCount >= 6 ? `${svgWidth}px` : undefined }}
          role="img"
          aria-label={chartData.caption || 'Biểu đồ cột'}
        >
          {/* Gridlines & Y axis */}
          {ticks.map((t, i) => {
            const y = valueToY(t);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke={i === 0 ? '#94a3b8' : '#e2e8f0'}
                  strokeWidth={i === 0 ? 1.2 : 1}
                  strokeDasharray={i === 0 ? undefined : '3 3'}
                />
                <text
                  x={padLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="#64748b"
                  fontFamily="ui-monospace, monospace"
                >
                  {formatChartNumber(Number(t.toFixed(2)))}
                </text>
              </g>
            );
          })}

          {/* Grouped bars */}
          {normalized.categories.map((cat, cIdx) => {
            const groupCenterX = padLeft + groupW * (cIdx + 0.5);
            const startX = groupCenterX - innerGroupW / 2;
            const shortCat = cat.length > 18 ? `${cat.slice(0, 17)}…` : cat;

            return (
              <g key={cIdx}>
                {normalized.series.map((s, sIdx) => {
                  const val = s.values[cIdx];
                  if (val === null || val === undefined || !Number.isFinite(val)) return null;
                  const bx = startX + sIdx * (barW + barGap);
                  const by = val >= 0 ? valueToY(val) : zeroY;
                  const bh = Math.max(2, Math.abs(valueToY(val) - zeroY));
                  const labelText = formatChartNumber(val, s.displayValues?.[cIdx]);

                  return (
                    <g key={sIdx}>
                      <rect
                        x={bx}
                        y={by}
                        width={barW}
                        height={bh}
                        rx={3}
                        fill={s.color || SERIES_PALETTE[sIdx % SERIES_PALETTE.length]}
                        opacity={0.92}
                      />
                      <text
                        x={bx + barW / 2}
                        y={val >= 0 ? Math.max(12, by - 4) : by + bh + 11}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="700"
                        fill="#1e293b"
                        fontFamily="ui-monospace, monospace"
                      >
                        {labelText}
                      </text>
                    </g>
                  );
                })}
                <text
                  x={groupCenterX}
                  y={svgHeight - padBottom + 16}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="600"
                  fill="#334155"
                >
                  {shortCat}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderLineOrAreaSvg = () => {
    const catCount = normalized.categories.length;
    const svgWidth = Math.max(460, catCount * 76 + 76);
    const svgHeight = compact ? 225 : 260;
    const padLeft = 52;
    const padRight = 24;
    const padTop = 24;
    const padBottom = 52;
    const plotW = svgWidth - padLeft - padRight;
    const plotH = svgHeight - padTop - padBottom;

    const range = Math.max(normalized.maxVal - normalized.minVal, 0.001);
    const yMax = normalized.maxVal + range * 0.14;
    const yMin = normalized.minVal;
    const ySpan = Math.max(yMax - yMin, 0.001);
    const valueToY = (v: number) => padTop + plotH - ((v - yMin) / ySpan) * plotH;
    const idxToX = (idx: number) =>
      catCount <= 1 ? padLeft + plotW / 2 : padLeft + (plotW * idx) / (catCount - 1);

    const gridSteps = 4;
    const ticks = Array.from({ length: gridSteps + 1 }, (_, i) => yMin + (ySpan * i) / gridSteps);

    return (
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto block"
          style={{ minWidth: catCount >= 7 ? `${svgWidth}px` : undefined }}
          role="img"
          aria-label={chartData.caption || 'Biểu đồ đường'}
        >
          {ticks.map((t, i) => {
            const y = valueToY(t);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke={i === 0 ? '#94a3b8' : '#e2e8f0'}
                  strokeWidth={i === 0 ? 1.2 : 1}
                  strokeDasharray={i === 0 ? undefined : '3 3'}
                />
                <text
                  x={padLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="#64748b"
                  fontFamily="ui-monospace, monospace"
                >
                  {formatChartNumber(Number(t.toFixed(2)))}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {normalized.categories.map((cat, idx) => {
            const x = idxToX(idx);
            const shortCat = cat.length > 16 ? `${cat.slice(0, 15)}…` : cat;
            return (
              <text
                key={idx}
                x={x}
                y={svgHeight - padBottom + 18}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="600"
                fill="#334155"
              >
                {shortCat}
              </text>
            );
          })}

          {/* Series paths & points */}
          {normalized.series.map((s, sIdx) => {
            const color = s.color || SERIES_PALETTE[sIdx % SERIES_PALETTE.length];
            const pts = s.values
              .map((v, idx) =>
                v !== null && v !== undefined && Number.isFinite(v)
                  ? { x: idxToX(idx), y: valueToY(v), val: v, idx }
                  : null
              )
              .filter((p): p is { x: number; y: number; val: number; idx: number } => Boolean(p));

            if (pts.length === 0) return null;
            const pathD = pts
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
              .join(' ');
            const areaD =
              chartData.type === 'area' && pts.length >= 2
                ? `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
                : null;

            return (
              <g key={sIdx}>
                {areaD && <path d={areaD} fill={color} opacity={0.14} />}
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {pts.map((p) => (
                  <g key={p.idx}>
                    <circle cx={p.x} cy={p.y} r={4} fill="#ffffff" stroke={color} strokeWidth={2.2} />
                    <text
                      x={p.x}
                      y={Math.max(12, p.y - 8 - (sIdx % 2) * 10)}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#1e293b"
                      fontFamily="ui-monospace, monospace"
                    >
                      {formatChartNumber(p.val, s.displayValues?.[p.idx])}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderPieSvg = () => {
    const firstSeries = normalized.series[0];
    const sliceItems = normalized.categories.map((cat, idx) => {
      const rawVal = firstSeries.values[idx];
      const value = typeof rawVal === 'number' && Number.isFinite(rawVal) && rawVal > 0 ? rawVal : 0;
      return {
        label: cat,
        value,
        display: formatChartNumber(rawVal, firstSeries.displayValues?.[idx]),
        color: SERIES_PALETTE[idx % SERIES_PALETTE.length],
      };
    });
    const total = sliceItems.reduce((acc, it) => acc + it.value, 0) || 1;
    let currentAngle = 0;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5 py-1">
        <svg
          viewBox="0 0 200 200"
          className={compact ? 'w-36 h-36 shrink-0' : 'w-44 h-44 shrink-0'}
          role="img"
          aria-label={chartData.caption || 'Biểu đồ tròn'}
        >
          {sliceItems.map((sl, idx) => {
            const angle = (sl.value / total) * 360;
            const start = currentAngle;
            currentAngle += angle;
            if (sl.value <= 0) return null;
            return (
              <path
                key={idx}
                d={describePieSlice(100, 100, 86, start, start + angle)}
                fill={sl.color}
                stroke="#ffffff"
                strokeWidth={1.8}
              />
            );
          })}
        </svg>
        <div className="flex-1 w-full space-y-1.5 text-xs">
          {sliceItems.map((sl, idx) => {
            const pct = ((sl.value / total) * 100).toFixed(1).replace('.', ',');
            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200/80"
              >
                <span className="flex items-center gap-2 font-semibold text-slate-800 min-w-0">
                  <span
                    className="w-3 h-3 rounded-xs shrink-0"
                    style={{ backgroundColor: sl.color }}
                  />
                  <span className="truncate">{sl.label}</span>
                </span>
                <span className="font-mono font-bold text-slate-900 shrink-0 tabular-nums">
                  {sl.display}
                  {normalized.unit ? ` ${normalized.unit}` : ''} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`rounded-lg border border-slate-300 bg-white overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800">
          <HeaderIcon className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="break-words">
            {chartData.caption || 'Biểu đồ dữ liệu thực nghiệm'}
          </span>
        </span>
        <div className="flex items-center gap-2">
          {normalized.unit && (
            <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
              Đơn vị: {normalized.unit}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowRawDataTable((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
          >
            <TableIcon className="w-3 h-3 text-emerald-700" />
            <span>{showRawDataTable ? 'Ẩn bảng số liệu' : 'Số liệu gốc'}</span>
          </button>
        </div>
      </div>

      <div className={compact ? 'p-2.5 sm:p-3' : 'p-3.5 sm:p-4'}>
        {/* Legend for multi-series charts */}
        {normalized.isMultiSeries && chartData.type !== 'pie' && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 pb-2 border-b border-slate-100 text-xs">
            {normalized.series.map((s, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                <span
                  className="w-3 h-3 rounded-xs shrink-0"
                  style={{ backgroundColor: s.color || SERIES_PALETTE[idx % SERIES_PALETTE.length] }}
                />
                <span>{s.name}</span>
              </span>
            ))}
          </div>
        )}

        {/* Chart body */}
        {isHorizontalSingleBar ? (
          <div className="space-y-2.5">
            {(() => {
              const maxVal = Math.max(
                ...chartData.items.map((it) => (Number.isFinite(it.value) ? Math.abs(it.value) : 0)),
                0.1
              );
              return chartData.items.map((item, idx) => {
                const pct = Math.min(
                  100,
                  Math.max(12, (Math.abs(item.value) / (maxVal * 1.12)) * 100)
                );
                const labelVal = formatChartNumber(item.value, item.displayValue);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-800">{item.label}</span>
                      <span className="font-mono font-bold text-emerald-800 shrink-0 tabular-nums">
                        {labelVal}
                        {normalized.unit ? ` ${normalized.unit}` : ''}
                      </span>
                    </div>
                    <div className="h-6 w-full bg-slate-100 rounded-md overflow-hidden p-0.5 border border-slate-200 flex items-center">
                      <div
                        className={`h-full rounded transition-all flex items-center justify-end pr-2 text-[11px] font-mono font-bold text-white ${
                          item.highlight
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-500'
                            : 'bg-gradient-to-r from-slate-600 to-slate-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      >
                        <span className="drop-shadow-xs">{labelVal}</span>
                      </div>
                    </div>
                    {item.subLabel && (
                      <p className="text-[11px] text-slate-500 italic pl-1">{item.subLabel}</p>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        ) : chartData.type === 'pie' ? (
          renderPieSvg()
        ) : chartData.type === 'line' || chartData.type === 'area' ? (
          renderLineOrAreaSvg()
        ) : (
          renderGroupedColumnSvg()
        )}

        {/* Exact original data table view */}
        {showRawDataTable && renderRawDataTable()}
      </div>

      {(chartData.source || chartData.note) && (
        <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[11px] sm:text-xs text-slate-600 space-y-0.5">
          {chartData.source && (
            <div className="italic text-right font-medium">{chartData.source}</div>
          )}
          {chartData.note && <div className="italic">{chartData.note}</div>}
        </div>
      )}
    </div>
  );
};
