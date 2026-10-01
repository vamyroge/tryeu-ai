import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { MODELS, PROVIDERS } from '../data/models.js'
import { formatMs } from '../utils/format.js'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import { Search, Zap, Gauge, MessageSquarePlus, ExternalLink, X } from 'lucide-react'

const SORTS = [
  { id: '', key: 'models.default' },
  { id: 'price-asc', key: 'models.priceAsc' },
  { id: 'price-desc', key: 'models.priceDesc' },
  { id: 'latency-asc', key: 'models.latencyAsc' },
  { id: 'latency-desc', key: 'models.latencyDesc' },
  { id: 'speed-desc', key: 'models.speedDesc' },
]

const STATUS_KEYS = { active: 'models.active', beta: 'models.beta', deprecated: 'models.deprecated' }

function ModelDetail({ model, onClose }) {
  const { createChat, navigate } = useApp()
  const { t } = useLanguage()
  const field = (label, value, strong) => (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-white/10 dark:bg-white/5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</div>
      <div className={`mt-1 tabular-nums ${strong ? 'text-lg font-semibold' : 'text-sm font-medium'}`}>{value}</div>
    </div>
  )

  const tryPlayground = () => {
    createChat(`${model.name} session`, model.id)
    navigate('playground')
  }

  return (
    <Modal title={model.name} onClose={onClose} width="max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg" style={{ backgroundColor: model.color }}>
            {model.name.split(/[\s-]/)[0][0]}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold tracking-tight">{model.name}</h4>
              <Badge status={model.status}>{t(STATUS_KEYS[model.status]) || model.status}</Badge>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {model.provider} · {model.contextWindow} {t('models.context').toLowerCase()}
            </p>
          </div>
        </div>
        <Badge status="active">{model.provider}</Badge>
      </div>

      <p className="mt-4 text-sm italic text-zinc-500 dark:text-zinc-400">“{model.tagline}”</p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{model.description}</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {field(t('models.contextWindow'), model.contextWindow, true)}
        {field(t('models.inputPrice'), `\$${model.inputPrice} / 1M`, true)}
        {field(t('models.outputPrice'), `\$${model.outputPrice} / 1M`, true)}
        {field(t('models.speed'), `${model.speed} tok/s`)}
        {field(t('models.avgLatency'), formatMs(model.latency), true)}
        {field(t('models.provider'), model.provider)}
        {field(t('models.status'), t(STATUS_KEYS[model.status]) || model.status)}
        {field(t('models.modelId'), model.id, false)}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-indigo-500/25 bg-indigo-500/5 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{t('models.tryModel')}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{t('models.tryModelDesc')}</div>
        </div>
        <button onClick={tryPlayground} className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400">
          <MessageSquarePlus size={14} /> {t('models.openPlayground')}
        </button>
      </div>
    </Modal>
  )
}

export default function Models() {
  const { modelsSearch, setModelsSearch } = useApp()
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [provider, setProvider] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (modelsSearch) {
      setQuery(modelsSearch)
      setModelsSearch('')
    }
  }, [modelsSearch, setModelsSearch])

  const filtered = useMemo(() => {
    let list = MODELS.filter((m) => {
      if (provider !== 'all' && m.provider !== provider) return false
      if (status !== 'all' && m.status !== status) return false
      if (query.trim() && !`${m.name} ${m.provider}`.toLowerCase().includes(query.trim().toLowerCase())) return false
      return true
    })
    const key = {
      'price-asc': (a, b) => a.inputPrice * 0.6 + a.outputPrice * 0.4 - (b.inputPrice * 0.6 + b.outputPrice * 0.4),
      'price-desc': (a, b) => b.inputPrice * 0.6 + b.outputPrice * 0.4 - (a.inputPrice * 0.6 + a.outputPrice * 0.4),
      'latency-asc': (a, b) => a.latency - b.latency,
      'latency-desc': (a, b) => b.latency - a.latency,
      'speed-desc': (a, b) => b.speed - a.speed,
    }[sort]
    if (key) list = [...list].sort(key)
    return list
  }, [query, provider, status, sort])

  const selectCls =
    'rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 outline-none transition focus:border-indigo-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300'

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('models.title')}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {filtered.length} {t('models.available')} {MODELS.length} {t('models.modelsAvailable')} {PROVIDERS.length} {t('models.providers')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('models.searchPlaceholder')}
              className={`${selectCls} w-44 pl-8`}
            />
          </div>
          <select value={provider} onChange={(e) => setProvider(e.target.value)} className={selectCls}>
            <option value="all">{t('models.allProviders')}</option>
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
            <option value="all">{t('models.allStatuses')}</option>
            <option value="active">{t('models.active')}</option>
            <option value="beta">{t('models.beta')}</option>
            <option value="deprecated">{t('models.deprecated')}</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={`${selectCls} flex items-center gap-1`}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {sort === s.id && s.id ? '↓ ' : ''}
                {t(s.key)}
              </option>
            ))}
          </select>
          {(query || provider !== 'all' || status !== 'all' || sort) && (
            <button
              onClick={() => {
                setQuery('')
                setProvider('all')
                setStatus('all')
                setSort('')
              }}
              className="flex items-center gap-1 text-xs font-medium text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={13} /> {t('models.reset')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m)}
            className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg dark:border-white/10 dark:bg-[#0e131c] dark:hover:border-white/20"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 opacity-10" style={{ background: `linear-gradient(135deg, ${m.color}, transparent)` }} />
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: m.color }}>
                  {m.name.split(/[\s-]/)[0][0]}
                </span>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">{m.name}</h3>
                  <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{m.provider}</p>
                </div>
              </div>
              <Badge status={m.status}>{t(STATUS_KEYS[m.status]) || m.status}</Badge>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{m.tagline}</p>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-zinc-50 py-2 dark:bg-white/5">
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t('models.input')}</div>
                <div className="mt-0.5 text-xs font-semibold tabular-nums">\${m.inputPrice}</div>
              </div>
              <div className="rounded-lg bg-zinc-50 py-2 dark:bg-white/5">
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t('models.output')}</div>
                <div className="mt-0.5 text-xs font-semibold tabular-nums">\${m.outputPrice}</div>
              </div>
              <div className="rounded-lg bg-zinc-50 py-2 dark:bg-white/5">
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t('models.context')}</div>
                <div className="mt-0.5 text-xs font-semibold">{m.contextWindow}</div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-500 dark:border-white/5 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <Zap size={12} /> {m.speed} tok/s
              </span>
              <span className="flex items-center gap-1">
                <Gauge size={12} /> {formatMs(m.latency)}
              </span>
              <span className="flex items-center gap-1 font-medium text-indigo-500 opacity-0 transition group-hover:opacity-100">
                {t('models.details')} <ExternalLink size={11} />
              </span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="py-16 text-center">
          <p className="text-sm font-medium text-zinc-500">{t('models.noMatch')}</p>
          <button onClick={() => { setQuery(''); setProvider('all'); setStatus('all'); setSort('') }} className="mt-2 text-xs text-indigo-500 hover:underline">
            {t('models.clearFilters')}
          </button>
        </Card>
      )}

      {selected && <ModelDetail model={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}