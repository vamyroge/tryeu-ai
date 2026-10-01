import { useState } from 'react'

export default function BarChart({ data, height = 220, color = '#6366f1', formatValue, formatLabel }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="relative w-full" style={{ height }}>
      <div className="flex h-full items-end gap-1.5">
        {data.map((d, i) => {
          const pct = Math.max((d.value / max) * 100, 0.5)
          return (
            <div
              key={i}
              className="group relative flex h-full flex-1 items-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                className="w-full rounded-t-md transition-all duration-200 group-hover:brightness-125"
                style={{
                  height: `${pct}%`,
                  background: `linear-gradient(180deg, ${color}, ${color}66)`,
                }}
              />
              {hover === i && (
                <div
                  className="pointer-events-none absolute z-20 -translate-x-1/2 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs shadow-lg dark:border-white/10 dark:bg-[#161b26]"
                  style={{ bottom: `calc(${pct}% + 8px)`, left: '50%' }}
                >
                  <div className="font-semibold tabular-nums">{formatValue ? formatValue(d.value) : String(d.value)}</div>
                  {formatLabel ? (
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{formatLabel(d.label, i)}</div>
                  ) : (
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{d.label}</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}