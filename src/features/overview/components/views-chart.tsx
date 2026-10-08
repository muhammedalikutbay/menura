import { cn } from "@/lib/cn";
import { buildChartBars, formatCount, formatShortDate, type DayCount } from "../chart";

/**
 * Daily menu views as a bar chart built from plain markup. The visual part is hidden from
 * assistive tech; the `role="img"` summary and the visually hidden table carry the data.
 */
export function ViewsChart({ days }: { days: DayCount[] }) {
  const { bars, max, total } = buildChartBars(days);
  const first = days[0];
  const last = days.at(-1);
  const summary =
    first && last
      ? `${formatShortDate(first.day)} – ${formatShortDate(last.day)} arası toplam ${formatCount(total)} görüntülenme. En yüksek günlük değer ${formatCount(max)}.`
      : "Görüntülenme verisi yok.";

  return (
    <figure className="flex flex-col gap-3">
      <div role="img" aria-label={summary} className="relative">
        <div aria-hidden="true" className="flex h-44 items-stretch gap-1 sm:gap-1.5">
          {/* Y axis reference lines */}
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[11px] leading-none text-fg-muted">
              <span className="w-6 shrink-0 text-right tabular-nums">{formatCount(max)}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="flex items-center gap-2 text-[11px] leading-none text-fg-muted">
              <span className="w-6 shrink-0 text-right tabular-nums">0</span>
              <span className="h-px flex-1 bg-border" />
            </div>
          </div>

          <div className="relative ml-8 flex flex-1 items-stretch gap-1 sm:gap-1.5">
            {bars.map((bar, index) => (
              <div
                key={bar.day}
                title={`${bar.label}: ${formatCount(bar.count)} görüntülenme`}
                className="group flex min-w-0 flex-1 flex-col items-center"
              >
                <div className="relative flex w-full flex-1 items-end justify-center">
                  <span className="pointer-events-none absolute -top-5 z-10 rounded-full bg-ink px-2 py-0.5 text-[11px] leading-none font-medium whitespace-nowrap text-ink-fg tabular-nums opacity-0 transition-opacity group-hover:opacity-100">
                    {formatCount(bar.count)}
                  </span>
                  <div
                    className={cn(
                      "w-full max-w-6 rounded-full transition-colors",
                      bar.count > 0 ? "bg-accent group-hover:bg-accent-hover" : "bg-border-strong/60",
                    )}
                    style={{ height: bar.count > 0 ? `${bar.heightPercent}%` : "2px" }}
                  />
                </div>
                <span
                  className={cn(
                    "mt-2 h-4 text-[10px] leading-4 whitespace-nowrap text-fg-muted sm:text-[11px]",
                    // Every second label on narrow screens keeps the axis readable.
                    index % 2 === (bars.length - 1) % 2 ? "" : "invisible sm:visible",
                  )}
                >
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        {total === 0 && (
          <p className="absolute inset-x-0 top-1/3 text-center text-sm text-fg-muted">
            Bu dönemde henüz görüntülenme yok.
          </p>
        )}
      </div>

      <figcaption className="sr-only">Son {days.length} günde günlük menü görüntülenmeleri</figcaption>
      <table className="sr-only">
        <caption>Günlük menü görüntülenmeleri</caption>
        <thead>
          <tr>
            <th scope="col">Tarih</th>
            <th scope="col">Görüntülenme</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((bar) => (
            <tr key={bar.day}>
              <th scope="row">{bar.label}</th>
              <td>{formatCount(bar.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
