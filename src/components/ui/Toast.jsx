import { useApp } from '../../context/AppContext.jsx'
import { CheckCircle2, Info, AlertTriangle, X, XCircle } from 'lucide-react'

const ICONS = {
  success: <CheckCircle2 size={16} className="text-emerald-500" />,
  info: <Info size={16} className="text-sky-500" />,
  warning: <AlertTriangle size={16} className="text-amber-500" />,
  error: <XCircle size={16} className="text-rose-500" />,
}

export default function Toast() {
  const { toast, dismissToast } = useApp()
  if (!toast) return null
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 animate-slide-up">
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white py-2.5 pl-3 pr-4 shadow-2xl dark:border-white/10 dark:bg-[#121722]">
        {ICONS[toast.type] || ICONS.success}
        <span className="text-sm text-zinc-700 dark:text-zinc-200">{toast.message}</span>
        <button onClick={dismissToast} className="ml-1 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-200">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}