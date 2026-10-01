import { useState } from 'react'

export default function DonutChart({ data, size = 180, thickness = 20, formatValue }) {
  const [hover, setHover] = useState(null)
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let acc = 0

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness} className="stroke-zinc-100 dark:stroke-white/5" />
          {data.map((d, i) => {
            const frac = d.value / total
            const dash = c * frac
            const offset = -acc * c
            acc += frac
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={hover === i ? thickness + 4 : thickness}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums tracking-tight">
            {hover !== null ? formatValue(data[hover].value) : formatValue(total)}
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{hover !== null ? data[hover].label : 'Total'}</span>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-1.5">
        {data.map((d, i) => (
          <li
            key={i}
            className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition ${hover === i ? 'bg-zinc-100 dark:bg-white/5' : ''}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: d.color }} />
              <span className="truncate">{d.label}</span>
            </span>
            <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
              {formatValue(d.value)}
              <span className="ml-1.5 tabular-nums text-zinc-400 dark:text-zinc-500">{((d.value / total) * 100).toFixed(1)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}