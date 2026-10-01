import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { formatRelative, formatNumber, generateApiKey } from '../utils/format.js'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import Toggle from '../components/ui/Toggle.jsx'
import { Plus, Copy, Ban, Trash2, KeyRound, Check, Eye, EyeOff } from 'lucide-react'

export default function ApiKeys() {
  const { apiKeys, createKey, revokeKey, showToast } = useApp()
  const { t } = useLanguage()
  const [filter, setFilter] = useState('active')
  const [createOpen, setCreateOpen] = useState(false)
  const [showFull, setShowFull] = useState({})
  const [copied, setCopied] = useState(null)
  const [generated, setGenerated] = useState(null)

  const visible = apiKeys.filter((k) => (filter === 'all' ? true : k.status === filter))

  const copy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 1400)
    } catch (e) {
      showToast(t('keys.copyFailed'), 'error')
    }
  }

  const generate = (name) => {
    const key = generateApiKey()
    const record = {
      id: `key-${Date.now().toString(36)}`,
      name: name || 'API key',
      key,
      created: new Date().toISOString(),
      lastUsed: new Date(Date.now() - 42 * 60000).toISOString(),
      status: 'active',
      used: Math.floor(Math.random() * 800),
      masked: `${key.slice(0, 7)}…${key.slice(-4)}`,
    }
    createKey(name)
    setGenerated(record)
    setCreateOpen(false)
  }

  const tabCls = (active) =>
    `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
      active ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-white/10 dark:text-white dark:ring-white/10' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
    }`

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('keys.title')}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('keys.subtitle')}</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-500 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:bg-indigo-400">
          <Plus size={15} /> {t('keys.generate')}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {['active', 'revoked', 'all'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={tabCls(filter === f)}>
            {f === 'all' ? `${apiKeys.length} ${t('keys.total')}` : `${t(`keys.${f}`)} (${apiKeys.filter((k) => k.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 && (
          <Card className="py-16 text-center">
            <KeyRound size={28} className="mx-auto text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm font-medium text-zinc-500">{t('keys.noKeys')} {filter === 'revoked' ? t('keys.revoked') : t('keys.active')} {t('keys.keysYet')}</p>
            {filter !== 'revoked' && (
              <button onClick={() => setCreateOpen(true)} className="mt-2 text-xs text-indigo-500 hover:underline">
                {t('keys.generateFirst')}
              </button>
            )}
          </Card>
        )}

        {visible.map((k) => {
          const active = k.status === 'active'
          const secret = showFull[k.id] || k.id.startsWith('key-')
          return (
            <div key={k.id} className="rounded-xl border border-zinc-200 bg-white p-4 transition dark:border-white/10 dark:bg-[#0e131c]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-400'}`}>
                    <KeyRound size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {k.name}
                      <Badge status={active ? 'success' : 'neutral'}>{active ? t('keys.active') : t('keys.revoked')}</Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <span className="font-mono text-[11px]">{secret ? k.key : k.masked || shortKeyPad(k.key)}</span>
                        <button onClick={() => setShowFull((s) => ({ ...s, [k.id]: !s[k.id] }))} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" aria-label="Toggle visibility">
                          {showFull[k.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </span>
                      {' | '}
                      <span>{t('keys.created')} {formatRelative(new Date(k.created))}</span>
                      {' | '}
                      <span>{formatNumber(k.used || 0)} {t('keys.requests')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {active && (
                    <button onClick={() => copy(k.key, k.id)} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5">
                      {copied === k.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      {copied === k.id ? t('keys.copied') : t('keys.copy')}
                    </button>
                  )}
                  {active && (
                    <button
                      onClick={() => {
                        revokeKey(k.id)
                        showToast(`${t('keys.keyRevoked')} “${k.name}” ${t('keys.revokedSuffix')}`)
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50 dark:border-rose-500/20 dark:hover:bg-rose-500/10"
                    >
                      <Ban size={13} /> {t('keys.revoke')}
                    </button>
                  )}
                  {!active && (
                    <button onClick={() => showToast(t('keys.cannotRestore'), 'info')} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-400">
                      <Trash2 size={13} /> {t('keys.delete')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
        <KeyRound size={15} className="mt-0.5 shrink-0 text-indigo-500" />
        <p>
          {t('keys.info')} <code className="font-mono">crypto.getRandomValues</code> {t('keys.infoSuffix')}
        </p>
      </div>

      <CreateKeyModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onGenerate={generate}
      />

      <RevealModal key={generated?.id} generated={generated} onClose={() => setGenerated(null)} onCopy={copy} />
    </div>
  )
}

function shortKeyPad(key) {
  return `${key.slice(0, 7)}…${key.slice(-4)}`
}

function CreateKeyModal({ open, onClose, onGenerate }) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [restricted, setRestricted] = useState(false)
  if (!open) return null
  return (
    <Modal
      title={t('keys.generateTitle')}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-white/10">
            {t('topbar.cancel')}
          </button>
          <button
            onClick={() => {
              onGenerate(name)
              setName('')
              setRestricted(false)
            }}
            className="rounded-lg bg-indigo-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            {t('keys.generate')}
          </button>
        </>
      }
    >
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('keys.keyName')}</label>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onGenerate(name)}
        placeholder={t('keys.keyNamePlaceholder')}
        className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5"
      />
      <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-200 px-3.5 py-3 dark:border-white/10">
        <div>
          <div className="text-sm font-medium">{t('keys.readOnly')}</div>
          <div className="text-xs text-zinc-400">{t('keys.readOnlyDesc')}</div>
        </div>
        <Toggle checked={restricted} onChange={setRestricted} />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">
        {t('keys.copyNow')}
      </p>
    </Modal>
  )
}

function RevealModal({ generated, onClose, onCopy }) {
  const { t } = useLanguage()
  if (!generated) return null
  return (
    <Modal
      title={t('keys.generatedTitle')}
      onClose={onClose}
      width="max-w-md"
      footer={
        <>
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-white/10">
            {t('keys.done')}
          </button>
          <button onClick={() => onCopy(generated.key, 'reveal')} className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400">
            <Copy size={14} /> {t('keys.copyClipboard')}
          </button>
        </>
      }
    >
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('keys.copyNew')}</p>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3.5">
        <code className="break-all font-mono text-sm text-emerald-600 dark:text-emerald-400">{generated.key}</code>
      </div>
    </Modal>
  )
}