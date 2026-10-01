import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { MODELS } from '../data/models.js'
import { formatRelative } from '../utils/format.js'
import { Bell, ChevronDown, Menu, Plus, Search, CheckCheck, LogOut, Settings, Sun, Moon, Sparkles, AlertTriangle, CreditCard, Info, X } from 'lucide-react'
import Dropdown from '../components/ui/Dropdown.jsx'
import Modal from '../components/ui/Modal.jsx'
import LanguageSwitcher from '../components/ui/LanguageSwitcher.jsx'

const PAGE_LABELS = {
  overview: 'nav.overview',
  models: 'nav.models',
  playground: 'nav.playground',
  usage: 'nav.usage',
  keys: 'nav.keys',
  settings: 'nav.settings',
}

const NOTIF_ICONS = {
  warning: <AlertTriangle size={15} className="text-amber-500" />,
  model: <Sparkles size={15} className="text-indigo-500" />,
  billing: <CreditCard size={15} className="text-sky-500" />,
  info: <Info size={15} className="text-zinc-400" />,
}

function SearchBar() {
  const { navigate, setModelsSearch } = useApp()
  const { t } = useLanguage()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const query = q.trim().toLowerCase()
  const pages = Object.entries(PAGE_LABELS)
    .filter(([, key]) => t(key).toLowerCase().includes(query))
    .map(([id, key]) => ({ id, label: t(key), type: 'page' }))
  const models = query
    ? MODELS.filter((m) => m.name.toLowerCase().includes(query) || m.provider.toLowerCase().includes(query)).map((m) => ({
        id: m.id,
        label: m.name,
        sub: m.provider,
        type: 'model',
      }))
    : []

  const pick = (r) => {
    setOpen(false)
    setQ('')
    if (r.type === 'page') navigate(r.id)
    else {
      setModelsSearch(r.label)
      navigate('models')
    }
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
          if (e.key === 'Enter' && (pages[0] || models[0])) pick(pages[0] || models[0])
        }}
        placeholder={t('topbar.search')}
        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500 dark:focus:bg-white/10"
      />
      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 animate-pop-in overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0e131c]">
          <div className="border-b border-zinc-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:border-white/5 dark:text-zinc-500">
            {query ? t('topbar.results') : t('topbar.quickNav')}
          </div>
          {(query && pages.length + models.length === 0) && (
            <div className="px-3 py-4 text-center text-sm text-zinc-400">{t('topbar.noMatches')} “{q}”</div>
          )}
          {!query &&
            pages.map((p) => (
              <button key={p.id} onClick={() => pick(p)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-white/5">
                <span className="text-zinc-400">›</span> {p.label}
                <span className="ml-auto text-[11px] uppercase tracking-wide text-zinc-300 dark:text-zinc-600">{t('topbar.page')}</span>
              </button>
            ))}
          {models.map((m) => (
            <button key={m.id} onClick={() => pick(m)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-white/5">
              <span className="size-2 rounded-full" style={{ backgroundColor: MODELS.find((x) => x.id === m.id)?.color }} />
              <span>{m.label}</span>
              <span className="text-xs text-zinc-400">{m.sub}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationsMenu() {
  const { notifications, markAllRead, dismissNotification } = useApp()
  const { t } = useLanguage()
  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2.5 dark:border-white/5">
        <span className="text-sm font-semibold">{t('topbar.notifications')}</span>
        <button onClick={markAllRead} className="flex items-center gap-1 text-[11px] font-medium text-indigo-500 hover:text-indigo-400">
          <CheckCheck size={13} /> {t('topbar.markAllRead')}
        </button>
      </div>
      {notifications.length === 0 && <div className="px-4 py-8 text-center text-sm text-zinc-400">{t('topbar.allCaughtUp')}</div>}
      {notifications.map((n) => (
        <div key={n.id} className={`group relative border-b border-zinc-50 px-3 py-2.5 dark:border-white/5 ${n.read ? '' : 'bg-indigo-50/50 dark:bg-indigo-500/5'}`}>
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0">{NOTIF_ICONS[n.type] || NOTIF_ICONS.info}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="truncate">{n.title}</span>
                {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-indigo-500" />}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{n.body}</p>
              <span className="mt-1 block text-[10px] text-zinc-400 dark:text-zinc-500">{formatRelative(new Date(n.time))}</span>
            </div>
            {n.read && (
              <button onClick={() => dismissNotification(n.id)} className="shrink-0 rounded-md p-1 text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-white/10">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function NewProjectModal({ open, onClose }) {
  const { createChat, navigate, settings } = useApp()
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [model, setModel] = useState(settings.defaultModel || 'gpt-4o')

  const create = () => {
    createChat(name.trim() || t('playground.newChat'), model)
    onClose()
    setName('')
    navigate('playground')
  }

  if (!open) return null
  return (
    <Modal
      title={t('topbar.newProjectTitle')}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-white/10">
            {t('topbar.cancel')}
          </button>
          <button onClick={create} className="rounded-lg bg-indigo-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400">
            {t('topbar.createProject')}
          </button>
        </>
      }
    >
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('topbar.projectName')}</label>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && create()}
        placeholder={t('topbar.projectNamePlaceholder')}
        className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5"
      />
      <label className="mt-4 block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('topbar.defaultModel')}</label>
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-white/5"
      >
        {MODELS.filter((m) => m.status === 'active').map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} — {m.provider}
          </option>
        ))}
      </select>
    </Modal>
  )
}

export default function Topbar() {
  const { page, unreadCount, session, theme, setTheme, navigate, signOut, setSidebarOpen } = useApp()
  const { t } = useLanguage()
  const [projectOpen, setProjectOpen] = useState(false)
  const initials = (session?.name || 'U')
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-white/10 dark:bg-[#070b11]/80 lg:px-6">
      <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 lg:hidden" aria-label="Open menu">
        <Menu size={19} />
      </button>

      <h1 className="hidden text-sm font-semibold sm:block">{t(PAGE_LABELS[page])}</h1>

      <div className="flex-1" />

      <div className="hidden sm:block">
        <SearchBar />
      </div>

      <LanguageSwitcher />

      <Dropdown
        width="w-80"
        trigger={(toggle) => (
          <button onClick={toggle} className="relative rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-white/10" aria-label={t('topbar.notifications')}>
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        )}
      >
        <NotificationsMenu />
      </Dropdown>

      <button
        onClick={() => setProjectOpen(true)}
        className="hidden items-center gap-1.5 rounded-lg bg-indigo-500 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:bg-indigo-400 sm:flex"
      >
        <Plus size={15} /> {t('topbar.newProject')}
      </button>

      <Dropdown
        width="w-64"
        trigger={(toggle) => (
          <button onClick={toggle} className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-zinc-100 dark:hover:bg-white/10">
            <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold text-white">
              {initials || 'U'}
            </span>
            <span className="hidden text-left md:block">
              <span className="block max-w-28 truncate text-xs font-semibold leading-tight">{session?.name || 'User'}</span>
              <span className="block text-[10px] text-zinc-400">{t('topbar.proWorkspace')}</span>
            </span>
            <ChevronDown size={14} className="hidden text-zinc-400 md:block" />
          </button>
        )}
      >
        {(close) => (
          <div className="py-1.5">
            <div className="border-b border-zinc-100 px-3.5 py-2.5 dark:border-white/5">
              <div className="text-sm font-semibold">{session?.name || 'User'}</div>
              <div className="truncate text-xs text-zinc-400">{session?.email || 'user@tryeu.ai'}</div>
            </div>
            <button onClick={() => { close(); navigate('settings') }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5">
              <Settings size={15} /> {t('topbar.preferences')}
            </button>
            <button
              onClick={() => { close(); setTheme(theme === 'dark' ? 'light' : 'dark') }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />} {theme === 'dark' ? t('topbar.lightMode') : t('topbar.darkMode')}
            </button>
            <div className="my-1 border-t border-zinc-100 dark:border-white/5" />
            <button onClick={() => { close(); signOut() }} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10">
              <LogOut size={15} /> {t('topbar.signOut')}
            </button>
          </div>
        )}
      </Dropdown>

      <NewProjectModal open={projectOpen} onClose={() => setProjectOpen(false)} />
    </header>
  )
}