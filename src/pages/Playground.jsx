import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { MODELS, getModel } from '../data/models.js'
import { getMockResponse, simulateTyping } from '../utils/mock.js'
import { formatTokens, formatCost, formatMs, uid } from '../utils/format.js'
import { Plus, Send, Trash2, MessageSquare, Settings2, Loader2, Eraser, Sparkles, Gauge, Coins, Timer } from 'lucide-react'

function markdownish(text) {
  const blocks = []
  let inCode = false
  let codeStart = null
  text.split('\n').forEach((line) => {
    if (line.trim().startsWith('```')) {
      if (inCode && codeStart) {
        blocks.push(codeStart)
        inCode = false
        codeStart = null
      } else {
        inCode = true
        codeStart = { type: 'code', lang: line.trim().replace('```', ''), lines: [] }
      }
      return
    }
    if (inCode && codeStart) {
      codeStart.lines.push(line)
      return
    }
    if (/^\s*[-*] /.test(line)) blocks.push({ type: 'li', text: line.replace(/^\s*[-*] /, '') })
    else if (line.trim()) blocks.push({ type: 'p', text: line })
  })
  if (inCode && codeStart) blocks.push(codeStart)
  return blocks
}

function RichText({ text }) {
  const blocks = useMemo(() => markdownish(text || ''), [text])
  const renderInline = (t) => {
    const parts = t.replace(/\*\*(.+?)\*\*/g, '\u0001$1\u0001').split('\u0001')
    return parts.map((p, i) => {
      if (i % 2 === 1) return <strong key={i}>{p}</strong>
      const codePart = p.split(/`([^`]+)`/g)
      return codePart.map((c, j) =>
        j % 2 === 1 ? (
          <code key={j} className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.85em] dark:bg-white/10">
            {c}
          </code>
        ) : (
          <span key={j}>{c}</span>
        ),
      )
    })
  }
  return (
    <div className="space-y-2">
      {blocks.map((b, i) => {
        if (b.type === 'code')
          return (
            <div key={i} className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-[#0b0e14]">
              <div className="flex items-center gap-1.5 border-b border-zinc-200 px-3 py-1.5 text-[10px] uppercase tracking-widest text-zinc-500 dark:border-white/10">
                <span className="size-2 rounded-full bg-rose-500/80" />
                <span className="size-2 rounded-full bg-amber-500/80" />
                <span className="size-2 rounded-full bg-emerald-500/80" />
                <span className="ml-2">{b.lang || 'code'}</span>
              </div>
              <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed">{b.lines.join('\n')}</pre>
            </div>
          )
        if (b.type === 'p')
          return (
            <p key={i} className="leading-relaxed">
              {renderInline(b.text)}
            </p>
          )
        if (b.type === 'li')
          return (
            <div key={i} className="flex gap-2 leading-relaxed">
              <span className="text-indigo-400">•</span>
              <span>{renderInline(b.text)}</span>
            </div>
          )
        return null
      })}
    </div>
  )
}

export default function Playground() {
  const { chats, activeChatId, setActiveChatId, createChat, updateChat, deleteChat, settings, showToast } = useApp()
  const { t } = useLanguage()

  const activeId = chats.some((c) => c.id === activeChatId) ? activeChatId : chats[0]?.id || null
  const chat = chats.find((c) => c.id === activeId) || null

  const [draft, setDraft] = useState('')
  const [temperature, setTemperature] = useState(settings.defaultTemperature)
  const [maxTokens, setMaxTokens] = useState(2048)
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.')
  const [modelId, setModelId] = useState(settings.defaultModel || 'gpt-4o')

  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [stat, setStat] = useState({ tokens: 0, latency: 0, cost: 0, running: false })

  const scrollRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (activeId && chat?.model) setModelId(chat.model)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [chat?.messages?.length, streamText, streaming])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  useEffect(() => {
    if (chat) setModelId(chat.model)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat?.id])

  const model = getModel(modelId) || getModel('gpt-4o')

  const onPickChat = (id) => {
    if (streaming) return
    setActiveChatId(id)
    setStreamText('')
    setStat({ tokens: 0, latency: 0, cost: 0, running: false })
  }

  const send = () => {
    const content = draft.trim()
    if (!content || streaming) return
    const chatId = chat ? chat.id : createChat(t('playground.newChat'), modelId).id
    const now = Date.now()
    const userMsg = { id: uid(), role: 'user', content, time: now }
    const pending = { id: uid(), role: 'assistant', content: '', pending: true, time: now }
    const base = chat ? chat.messages : []
    updateChat({ id: chatId, messages: [...base, userMsg, pending] })
    setDraft('')
    setStreamText('')
    setStreaming(true)
    setStat((s) => ({ ...s, running: true }))

    const latency = model.latency * (0.5 + Math.random() * 0.6)
    const fullText = getMockResponse(modelId, content).slice(0, maxTokens * 4)

    timerRef.current = setTimeout(() => {
      simulateTyping(
        fullText,
        (chunk) => setStreamText((t) => t + chunk),
        () => {
          setStreaming(false)
          setStreamText('')
          const inTokens = Math.ceil(content.split(/\s+/).length * 1.35)
          const outTokens = Math.ceil(fullText.length / 4)
          const tokens = inTokens + outTokens
          const cost = (inTokens / 1e6) * model.inputPrice + (outTokens / 1e6) * model.outputPrice
          const finalMsg = { role: 'assistant', content: fullText, time: Date.now() }
          updateChat({ id: chatId, messages: [...base, userMsg, finalMsg] })
          setStat({ tokens, latency: Math.round(latency), cost, running: false })
        },
      )
    }, 500 + Math.random() * 500)
  }

  const displayMessages = useMemo(() => {
    if (!chat) return []
    if (streaming) {
      return [...chat.messages.slice(0, -1), { ...chat.messages[chat.messages.length - 1], content: streamText, pending: true }]
    }
    return chat.messages
  }, [chat, streaming, streamText])

  const inputTokens = chat?.messages.filter((m) => m.role === 'user').reduce((a, m) => a + Math.ceil(m.content.split(/\s+/).length * 1.35), 0) || 0
  const outputTokens = chat?.messages.filter((m) => m.role === 'assistant').reduce((a, m) => a + Math.ceil((m.content || '').length / 4), 0) || 0

  const leftCls =
    'flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 outline-none transition focus:border-indigo-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300'

  return (
    <div className="grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)_280px]">
      <div className="order-2 space-y-4 xl:order-1">
        <section className="rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0e131c]">
          <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2.5 dark:border-white/10">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <MessageSquare size={13} /> {t('playground.chats')}
            </h3>
            <button onClick={() => { createChat(t('playground.newChat'), modelId) }} className="rounded-md p-1 text-indigo-500 transition hover:bg-indigo-500/10" aria-label={t('playground.newChat')}>
              <Plus size={15} />
            </button>
          </div>
          <div className="max-h-52 overflow-y-auto p-1.5">
            {chats.length === 0 && <p className="px-3 py-4 text-center text-xs text-zinc-400">{t('playground.noChats')}</p>}
            {chats.map((c) => (
              <div
                key={c.id}
                onClick={() => onPickChat(c.id)}
                className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition ${
                  c.id === activeId ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'hover:bg-zinc-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{c.name}</div>
                  <div className="truncate text-[10px] text-zinc-400 dark:text-zinc-500">
                    {c.messages.length} {t('playground.messages')} · {getModel(c.model)?.name || c.model}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChat(c.id)
                    showToast('Chat deleted.', 'info')
                  }}
                  className="shrink-0 rounded-md p-1 text-zinc-400 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100"
                  aria-label="Delete chat"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0e131c]">
          <div className="flex items-center gap-1.5 border-b border-zinc-200 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:border-white/10">
            <Settings2 size={13} /> {t('playground.parameters')}
          </div>
          <div className="space-y-4 p-3.5">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{t('playground.model')}</label>
              <select
                value={modelId}
                onChange={(e) => {
                  setModelId(e.target.value)
                  if (chat) updateChat({ id: chat.id, model: e.target.value })
                }}
                className={leftCls}
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id} disabled={m.status !== 'active' && m.status !== 'beta'}>
                    {m.name} ({m.provider})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{t('playground.temperature')}</label>
                <span className="text-xs font-semibold tabular-nums text-indigo-500">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="mt-0.5 flex justify-between text-[10px] text-zinc-400">{t('playground.precise')} · {t('playground.creative')}</div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{t('playground.maxTokens')}</label>
                <span className="text-xs font-semibold tabular-nums text-indigo-500">{formatTokens(maxTokens)}</span>
              </div>
              <input
                type="range"
                min="256"
                max="16000"
                step="128"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{t('playground.systemPrompt')}</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
                placeholder={t('playground.systemPromptPlaceholder')}
                className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-xs outline-none transition focus:border-indigo-400 dark:border-white/10 dark:bg-white/5"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="order-1 xl:order-2">
        <section className="flex h-[calc(100vh-9rem)] min-h-[520px] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#0e131c]">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: model.color }}>
                {model.name.split(/[\s-]/)[0][0]}
              </span>
              <div>
                <div className="text-sm font-semibold leading-tight">{model.name}</div>
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {chat?.name} · {model.provider}
                </div>
              </div>
            </div>
            {chat && (
              <button
                onClick={() => {
                  updateChat({ id: chat.id, messages: [] })
                  setStreamText('')
                  setStat({ tokens: 0, latency: 0, cost: 0, running: false })
                  showToast('Conversation cleared.')
                }}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
              >
                <Eraser size={13} /> {t('playground.clear')}
              </button>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {!chat && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15">
                  <Sparkles size={28} className="text-indigo-500" />
                </div>
                <h4 className="mt-4 text-lg font-bold">{t('playground.startTitle')}</h4>
                <p className="mt-1 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
                  {t('playground.startDesc')}
                </p>
                <button onClick={() => createChat(t('playground.newChat'), modelId)} className="mt-5 flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400">
                  <Plus size={15} /> {t('playground.newChat')}
                </button>
              </div>
            )}

            {chat && displayMessages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15">
                  <Sparkles size={24} className="text-indigo-500" />
                </div>
                <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{t('playground.askBegin')} “{t('playground.askExample')}”</p>
              </div>
            )}

            {displayMessages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-indigo-500 px-4 py-2.5 text-sm leading-relaxed text-white shadow-md shadow-indigo-500/20">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  <div className="flex max-w-[92%] gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white" style={{ backgroundColor: model.color }}>
                      {model.name.split(/[\s-]/)[0][0]}
                    </span>
                    <div className="rounded-2xl rounded-bl-md border border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-white/10 dark:bg-white/5">
                      {m.pending || streaming ? (
                        <RichText text={streamText} />
                      ) : (
                        <div className="text-sm text-zinc-700 dark:text-zinc-200">
                          <RichText text={m.content} />
                        </div>
                      )}
                      {(m.pending || streaming) && streamText === '' && (
                        <div className="flex items-center gap-1 py-1.5">
                          <span className="typing-dot size-1.5 rounded-full bg-zinc-400" />
                          <span className="typing-dot size-1.5 rounded-full bg-zinc-400" />
                          <span className="typing-dot size-1.5 rounded-full bg-zinc-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="border-t border-zinc-200 p-3.5 dark:border-white/10">
            <div className="flex items-end gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-2 transition focus-within:border-indigo-400 dark:border-white/10 dark:bg-white/5">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                rows={1}
                placeholder={`${t('playground.messagePlaceholder')} ${model.name}…`}
                className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-zinc-400"
              />
              <button
                onClick={send}
                disabled={streaming || !draft.trim()}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {streaming ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
              <span>⌘ {t('playground.enterToSend')} · {t('playground.shiftEnter')}</span>
              <span>{!chat ? t('playground.selectChat') : `${chat.messages.length} ${t('playground.messages')}`}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="order-3 space-y-4">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e131c]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{t('playground.lastResponse')}</h3>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                <Coins size={15} />
              </span>
              <div>
                <div className="text-base font-semibold tabular-nums">{stat.tokens ? formatTokens(stat.tokens) : '—'}</div>
                <div className="text-[11px] text-zinc-400">{t('playground.tokensUsed')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                <Timer size={15} />
              </span>
              <div>
                <div className="text-base font-semibold tabular-nums">{stat.latency ? formatMs(stat.latency) : '—'}</div>
                <div className="text-[11px] text-zinc-400">{t('playground.latency')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Coins size={15} />
              </span>
              <div>
                <div className="text-base font-semibold tabular-nums">{stat.cost ? formatCost(stat.cost) : '—'}</div>
                <div className="text-[11px] text-zinc-400">{t('playground.estimatedCost')}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-white/5 dark:text-zinc-400">
            {t('playground.sessionTokens')}: <span className="font-semibold tabular-nums">{formatTokens(inputTokens)}</span> {t('playground.in')} ·{' '}
            <span className="font-semibold tabular-nums">{formatTokens(outputTokens)}</span> {t('playground.out')}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e131c]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{t('playground.modelInfo')}</h3>
          <div className="mt-3 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">{t('playground.context')}</span>
              <span className="font-medium tabular-nums">{model.contextWindow}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{t('playground.inputPrice')}</span>
              <span className="font-medium tabular-nums">\${model.inputPrice}/1M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{t('playground.outputPrice')}</span>
              <span className="font-medium tabular-nums">\${model.outputPrice}/1M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{t('playground.speed')}</span>
              <span className="font-medium tabular-nums">{model.speed} tok/s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">{t('playground.status')}</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className={`size-1.5 rounded-full ${model.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {model.status}
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-2 text-[11px] text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
            <Gauge size={13} />
            {t('playground.simulated')}
          </div>
        </section>
      </div>
    </div>
  )
}