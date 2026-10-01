import {
  LayoutDashboard,
  BrainCircuit,
  MessageSquareText,
  BarChart3,
  KeyRound,
  Settings,
  Sun,
  Moon,
  Sparkles,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import Logo from '../components/ui/Logo.jsx'

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Workspace at a glance' },
  { id: 'models', label: 'AI Models', icon: BrainCircuit, desc: 'Browse and configure models' },
  { id: 'playground', label: 'Playground', icon: MessageSquareText, desc: 'Chat with any model' },
  { id: 'usage', label: 'Usage', icon: BarChart3, desc: 'Requests, tokens & cost' },
  { id: 'keys', label: 'API Keys', icon: KeyRound, desc: 'Manage access tokens' },
  { id: 'settings', label: 'Settings', icon: Settings, desc: 'Profile & preferences' },
]

function SidebarContent() {
  const { page, navigate, theme, setTheme } = useApp()
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-5">
        <Logo size={30} />
        <div>
          <div className="flex items-center gap-1.5 font-bold tracking-tight">
            TRYEU <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">AI</span>
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Developer Platform</div>
        </div>
      </div>

      <div className="px-4 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Workspace
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV.map(({ id, label, icon: Icon, desc }) => {
          const active = page === id
          return (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                active
                  ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-white/10 dark:text-white dark:ring-white/10'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100'
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className={active ? 'text-indigo-500' : ''} />
              <span className="flex-1">
                <span className="block text-[13px] font-medium">{label}</span>
                <span className={`block text-[11px] ${active ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'}`}>{desc}</span>
              </span>
              {active && <span className="size-1.5 rounded-full bg-indigo-500" />}
            </button>
          )
        })}
      </nav>

      <div className="p-4">
        <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles size={14} />
            Pro plan
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            Unlimited models, priority throughput and 24/7 support.
          </p>
          <button
            onClick={() => navigate('settings')}
            className="mt-2.5 w-full rounded-lg bg-indigo-500 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-400"
          >
            Manage plan
          </button>
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp()
  const { t } = useLanguage()
  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white transition-transform duration-200 dark:border-white/10 dark:bg-[#0b0f16] lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          className="absolute right-3 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label={t('common.close')}
        >
          <X size={16} />
        </button>
        <SidebarContent />
      </div>
    </>
  )
}