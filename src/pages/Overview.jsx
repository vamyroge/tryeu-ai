import { useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { MODELS, getModel } from '../data/models.js'
import { buildDailyData, buildRecentRequests } from '../utils/mock.js'
import { formatNumber, formatTokens, formatCost, formatMs, formatRelative } from '../utils/format.js'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import BarChart from '../components/charts/BarChart.jsx'
import LineChart from '../components/charts/LineChart.jsx'
import DonutChart from '../components/charts/DonutChart.jsx'
import { Cpu, Zap, Coins, DollarSign, Gauge, ArrowRight } from 'lucide-react'

const STATUS_TONE = { success: 'success', error: 'error', rate_limited: 'warning' }

export default function Overview() {
  const { navigate } = useApp()
  const { t } = useLanguage()

  const daily = useMemo(() => buildDailyData(90), [])
  const recent = useMemo(() => buildRecentRequests(14), [])

  const last7 = daily.slice(-7)
  const last30 = daily.slice(-30)
  const today = daily[daily.length - 1]
  const yesterday = daily[daily.length - 2] || today

  const pct = (a, b) => {
    if (!b) return 0
    return Math.round(((a - b) / b) * 100)
  }

  const requests7 = last7.map((d) => ({ label: d.date.slice(5), value: d.totalRequests }))
  const tokens30 = last30.map((d) => ({ label: d.date.slice(5), value: d.totalTokens }))

  const byModel7 = {}
  last7.forEach((d) => {
    Object.entries(d.byModel).forEach(([id, v]) => {
      if (!byModel7[id]) byModel7[id] = 0
      byModel7[id] += v.requests
    })
  })
  const donutData = Object.entries(byModel7)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, v]) => ({ label: getModel(id)?.name || id, value: v, color: getModel(id)?.color || '#6366f1' }))
  const rest = Object.entries(byModel7)
    .slice(6)
    .reduce((a, [, v]) => a + v, 0)
  if (rest > 0) donutData.push({ label: t('overview.others'), value: rest, color: '#8b8b8b' })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{t('overview.greeting')}</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('overview.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label={t('overview.aiModels')} value={formatNumber(MODELS.length)} delta={0} sub={t('overview.providers')} icon={Cpu} accent="#6366f1" />
        <StatCard label={t('overview.requestsToday')} value={formatNumber(today.totalRequests)} delta={pct(today.totalRequests, yesterday.totalRequests)} sub={t('overview.vsYesterday')} icon={Zap} accent="#0ea5e9" />
        <StatCard label={t('overview.tokensUsed')} value={formatTokens(today.totalTokens)} delta={pct(today.totalTokens, yesterday.totalTokens)} sub={t('overview.vsYesterday')} icon={Coins} accent="#10b981" />
        <StatCard label={t('overview.estimatedCost')} value={formatCost(today.totalCost)} delta={pct(today.totalCost, yesterday.totalCost)} sub={t('overview.today')} icon={DollarSign} accent="#f59e0b" />
        <StatCard label={t('overview.avgLatency')} value={formatMs(today.avgLatency)} delta={-pct(today.avgLatency, yesterday.avgLatency)} sub="TTFT" icon={Gauge} accent="#ec4899" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title={t('overview.requests7d')}
          subtitle={t('overview.requests7dSub')}
          className="lg:col-span-2"
          action={
            <button onClick={() => navigate('usage')} className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-400">
              {t('overview.analytics')} <ArrowRight size={13} />
            </button>
          }
        >
          <BarChart data={requests7} height={210} color="#6366f1" formatValue={(v) => formatNumber(v)} />
        </Card>

        <Card title={t('overview.modelUsage')} subtitle={t('overview.modelUsageSub')}>
          <DonutChart data={donutData} size={160} formatValue={(v) => formatNumber(v)} />
        </Card>

        <Card title={t('overview.tokenUsage')} subtitle={t('overview.tokenUsageSub')} className="lg:col-span-2">
          <LineChart data={tokens30} height={210} color="#10b981" formatValue={(v) => formatTokens(v)} />
        </Card>

        <Card title={t('overview.activeModels')} subtitle={t('overview.activeModelsSub')}>
          <div className="flex flex-wrap gap-2">
            {MODELS.filter((m) => m.status === 'active')
              .slice(0, 6)
              .map((m) => (
                <span key={m.id} className="flex items-center gap-2 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs dark:border-white/10">
                  <span className="size-2 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.name}
                </span>
              ))}
          </div>
        </Card>
      </div>

      <Card
        title={t('overview.recentRequests')}
        subtitle={t('overview.recentRequestsSub')}
        action={
          <button onClick={() => navigate('usage')} className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-400">
            {t('overview.viewAll')} <ArrowRight size={13} />
          </button>
        }
        pad={false}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:border-white/10 dark:text-zinc-500">
                <th className="px-4 py-2.5">{t('overview.time')}</th>
                <th className="px-4 py-2.5">{t('overview.model')}</th>
                <th className="px-4 py-2.5 text-right">{t('overview.tokens')}</th>
                <th className="px-4 py-2.5 text-right">{t('overview.latency')}</th>
                <th className="px-4 py-2.5 text-right">{t('overview.status')}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => {
                const m = getModel(r.model)
                return (
                  <tr key={r.id} className="border-b border-zinc-50 transition last:border-0 hover:bg-zinc-50/80 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="whitespace-nowrap px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{formatRelative(r.time)}</td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full" style={{ backgroundColor: m?.color }} />
                        <span className="font-medium">{m?.name || r.model}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatNumber(r.tokens)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatMs(r.latency)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge status={STATUS_TONE[r.status]}>{r.status.replace('_', ' ')}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}