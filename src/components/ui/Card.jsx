export default function Card({ title, subtitle, action, children, className = '', pad = true }) {
  return (
    <section className={`rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0e131c] ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-white/10">
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={pad ? 'p-4' : ''}>{children}</div>
    </section>
  )
}