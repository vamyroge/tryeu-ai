import { useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { MODELS, getModel } from '../data/models.js'
import { buildDailyData } from '../utils/mock.js'
import { formatNumber, formatTokens, formatCost, formatMs } from '../utils/format.js'
import Card from '../components/ui/Card.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import BarChart from '../components/charts/BarChart.jsx'
import LineChart from '../components/charts/LineChart.jsx'
import { Zap, Coins, DollarSign, Gauge, Filter } from 'lucide-react'

const RANGES = [
  { id: 7, key: 'usage.7days' },
  { id: 30, key: 'usage.30days' },
  { id: 90, key: 'usage.90days' },
]

export default function Usage() {
  const { t } = useLanguage()
  const [range, setRange] = useState(7)
  const [modelId, setModelId] = useState('all')

  const daily = useMemo(() => buildDailyData(90), [])
  const slice = useMemo(() => daily.slice(-range), [daily, range])

  const series = useMemo(() => {
    return slice.map((d) => {
      if (modelId === 'all') {
        return {
          label: d.date.slice(5),
          requests: d.totalRequests,
          tokens: d.totalTokens,
          cost: d.totalCost,
          latency: d.avgLatency,
        }
      }
      const m = d.byModel[modelId]
      return {
        label: d.date.slice(5),
        requests: m?.requests || 0,
        tokens: m?.tokens || 0,
        cost: m?.cost || 0,
        latency: m?.latency || 0,
      }
    })
  }, [slice, modelId])

  const totals = useMemo(() => {
    const req = series.reduce((a, d) => a + d.requests, 0)
    const tok = series.reduce((a, d) => a + d.tokens, 0)
    const cost = series.reduce((a, d) => a + d.cost, 0)
    const latSums = series
      .map((d) => ({ l: d.latency, r: d.requests }))
      .filter((x) => x.r > 0)
    const lat = latSums.length ? latSums.reduce((a, x) => a + x.l * x.r, 0) / latSums.reduce((a, x) => a + x.r, 0) : 0
    return { req, tok, cost, lat, perDay: req / (range || 1) }
  }, [series, range])

  const last = series.slice(-2)
  const curr = last[last.length - 1] ?? { requests: 0, tokens: 0, cost: 0, latency: 0 }
  const prev = last[last.length - 2] ?? curr
  const pct = (a, b) => (b ? Math.round(((a - b) / b) * 100) : 0)

  const reqData = series.map((d) => ({ label: d.label, value: d.requests }))
  const tokData = series.map((d) => ({ label: d.label, value: d.tokens }))
  const costData = series.map((d) => ({ label: d.label, value: Math.round(d.cost * 100) / 100 }))
  const latData = series.map((d) => ({ label: d.label, value: d.latency }))

  const tabCls = (active) =>
    `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
      active ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-white/10 dark:text-white dark:ring-white/10' : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
    }`

  const modelLabel = modelId === 'all' ? t('usage.allModels') : getModel(modelId)?.name

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('usage.title')}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('usage.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-white/10 dark:bg-white/5">
            {RANGES.map((r) => (
              <button key={r.id} onClick={() => setRange(r.id)} className={tabCls(range === r.id)}>
                {t(r.key)}
              </button>
            ))}
          </div>
          <div className="relative">
            <Filter size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white py-2 pl-8 pr-3 text-xs font-medium outline-none transition focus:border-indigo-400 dark:border-white/10 dark:bg-white/5"
            >
              <option value="all">{t('usage.allModels')}</option>
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label={t('usage.requestsPerDay')} value={formatNumber(totals.req)} delta={pct(curr.requests, prev.requests)} sub={`${formatNumber(totals.req)} ${t('usage.inPeriod')}`} icon={Zap} accent="#6366f1" />
        <StatCard label={t('usage.tokensPerDay')} value={formatTokens(totals.perDay * 1.2)} delta={pct(curr.tokens, prev.tokens)} sub={formatTokens(totals.tok)} icon={Coins} accent="#10b981" />
        <StatCard label={t('usage.costPerDay')} value={formatCost(totals.cost / (range || 1))} delta={pct(curr.cost, prev.cost)} sub={formatCost(totals.cost)} icon={DollarSign} accent="#f59e0b" />
        <StatCard label={t('usage.avgLatency')} value={formatMs(totals.lat)} delta={-pct(curr.latency, prev.latency)} sub={t('usage.weighted')} icon={Gauge} accent="#ec4899" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={t('usage.requestsChart')} subtitle={`${modelLabel} · ${range} ${t('usage.days')}`}>
          <BarChart data={reqData} height={230} color="#6366f1" formatValue={(v) => formatNumber(v)} />
        </Card>
        <Card title={t('usage.tokensChart')} subtitle={`${modelLabel} · ${range} ${t('usage.days')}`}>
          <LineChart data={tokData} height={230} color="#10b981" formatValue={(v) => formatTokens(v)} />
        </Card>
        <Card title={t('usage.costChart')} subtitle={`USD · ${range} ${t('usage.days')}`}>
          <BarChart data={costData} height={230} color="#f59e0b" formatValue={(v) => formatCost(v)} />
        </Card>
        <Card title={t('usage.latencyChart')} subtitle={`TTFT · ${range} ${t('usage.days')}`}>
          <LineChart data={latData} height={230} color="#ec4899" formatValue={(v) => formatMs(v)} />
        </Card>
      </div>
    </div>
  )
}