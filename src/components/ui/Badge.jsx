const STYLES = {
  active:
    'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400',
  beta: 'bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400',
  deprecated: 'bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400',
  success: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400',
  error: 'bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400',
  info: 'bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400',
  neutral: 'bg-zinc-500/10 text-zinc-600 ring-zinc-500/20 dark:text-zinc-400',
  default: 'bg-zinc-500/10 text-zinc-600 ring-zinc-500/20 dark:text-zinc-400',
}

export default function Badge({ status, children, className = '' }) {
  const tone = status || 'default'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STYLES[tone] || STYLES.default} ${className}`}
    >
      <span className={`size-1.5 rounded-full ${status === 'active' || status === 'success' ? 'bg-emerald-500' : status === 'beta' ? 'bg-amber-500' : ''}`} />
      {children || tone}
    </span>
  )
}