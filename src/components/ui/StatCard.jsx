import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ label, value, delta, sub, icon: Icon, accent = '#6366f1' }) {
  const up = (delta ?? 0) >= 0
  return (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-white/10 dark:bg-[#0e131c] dark:hover:border-white/20">
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full opacity-[0.07] blur-2xl transition group-hover:opacity-[0.12]"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <div className="rounded-lg p-1.5" style={{ backgroundColor: `${accent}1a`, color: accent }}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {delta !== undefined && delta !== null && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
              up ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta)}%
          </span>
        )}
        {sub && <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{sub}</span>}
      </div>
    </div>
  )
}