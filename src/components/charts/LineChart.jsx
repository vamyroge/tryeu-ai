import { useMemo, useState } from 'react'

export default function LineChart({ data, height = 220, color = '#6366f1', formatValue, formatLabel }) {
  const [hover, setHover] = useState(null)

  const max = Math.max(...data.map((d) => d.value), 1)
  const padY = max * 0.12

  const points = useMemo(() => {
    const n = data.length
    return data.map((d, i) => {
      const x = n === 1 ? 0 : (i / (n - 1)) * 100
      const y = ((max + padY - d.value) / (max + padY)) * 50
      return { x, y, ...d }
    })
  }, [data, max, padY])

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L 100 50 L 0 50 Z`
  const gridY = [0, 1, 2, 3, 4].map((i) => ((max + padY) / 4) * i)
  const labelStep = Math.max(1, Math.ceil(data.length / 12))

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    const idx = Math.round(frac * (data.length - 1))
    setHover(idx)
  }

  return (
    <div className="relative w-full" style={{ height }}>
      {gridY.map((v, i) => (
        <div
          key={i}
          className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-zinc-200 dark:border-white/5"
          style={{ top: `${(1 - v / (max + padY)) * 100}%` }}
        />
      ))}
      <svg
        className="relative h-full w-full overflow-visible"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="line-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#line-area)" />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {hover !== null && points[hover] && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs shadow-lg dark:border-white/10 dark:bg-[#161b26]"
          style={{ left: `${points[hover].x}%`, top: `${points[hover].y}%` }}
        >
          <div className="font-semibold tabular-nums">{formatValue ? formatValue(points[hover].value) : String(points[hover].value)}</div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {formatLabel ? formatLabel(points[hover].label, hover) : points[hover].label}
          </div>
        </div>
      )}
      <div className="pointer-events-none mt-1 flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
        {data
          .map((d, i) => (i % labelStep === 0 || i === data.length - 1 ? d.label : null))
          .filter(Boolean)
          .map((l, i, arr) => (
            <span key={i} className={i === arr.length - 1 ? 'text-right' : ''}>
              {l}
            </span>
          ))}
      </div>
    </div>
  )
}