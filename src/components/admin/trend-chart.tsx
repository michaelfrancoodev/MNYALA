import { formatTzs } from "@/lib/format";

export function TrendChart({
  data,
  title = "30-Day Activity Trend",
}: {
  data: Array<{ day: string; ordersCount: number; revenueTzs?: number }>;
  title?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface p-6 text-center text-sm text-muted">
        No order activity recorded in this period.
      </div>
    );
  }

  const maxOrders = Math.max(...data.map((d) => d.ordersCount), 1);
  const chartHeight = 120;
  const chartWidth = 600;
  const barWidth = Math.max(4, Math.floor(chartWidth / (data.length * 1.5)));
  const gap = Math.floor(chartWidth / data.length);

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <span className="text-xs text-muted">Daily Orders</span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
          className="w-full h-44 text-brand"
          role="img"
          aria-label={title}
        >
          {/* Base line */}
          <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="currentColor" strokeWidth="1" className="text-line-strong" />

          {/* Bars */}
          {data.map((d, i) => {
            const h = Math.round((d.ordersCount / maxOrders) * (chartHeight - 15));
            const x = i * gap + 5;
            const y = chartHeight - h;

            return (
              <g key={d.day} className="group">
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(h, 2)}
                  rx="2"
                  className="fill-brand hover:fill-brand-dark transition-colors"
                >
                  <title>{`${d.day}: ${d.ordersCount} orders ${d.revenueTzs != null ? `(${formatTzs(d.revenueTzs)})` : ""}`}</title>
                </rect>

                {/* Show label every 5 days or first/last */}
                {i % 5 === 0 || i === data.length - 1 ? (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 18}
                    textAnchor="middle"
                    className="text-[10px] fill-current text-muted font-mono"
                  >
                    {d.day.slice(5)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Accessible data table for screen readers and text alternative */}
      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-semibold text-muted hover:text-ink">
          View trend as table
        </summary>
        <table className="mt-2 w-full text-xs text-ink-soft border-collapse">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="py-1">Date</th>
              <th className="py-1 text-center">Orders</th>
              <th className="py-1 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.day} className="border-b border-line/40">
                <td className="py-1 font-mono">{d.day}</td>
                <td className="py-1 text-center font-semibold">{d.ordersCount}</td>
                <td className="py-1 text-right font-mono">{d.revenueTzs != null ? formatTzs(d.revenueTzs) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
