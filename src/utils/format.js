export function formatNumber(n) {
  if (n === null || n === undefined) return '\u2014'
  if (n >= 1e6) return `${(n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(n % 1e3 === 0 ? 0 : 1)}K`
  return String(Math.round(n))
}

export function formatTokens(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(n)
}

export function formatCost(n) {
  if (n === null || n === undefined) return '$0.00'
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}K`
  return `$${n.toFixed(2)}`
}

export function formatMs(ms) {
  if (!ms) return '0ms'
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${Math.round(ms)}ms`
}

export function formatDateTime(d) {
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return '\u2014'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelative(d) {
  const date = d instanceof Date ? d : new Date(d)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatShortDate(d) {
  const date = d instanceof Date ? d : new Date(d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function shortKey(key) {
  return `${key.slice(0, 7)}\u2026${key.slice(-4)}`
}

export function uid(prefix = '') {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replaceAll('-', '').slice(0, 16)
      : Math.random().toString(36).slice(2, 12)
  return `${prefix}${prefix ? '_' : ''}${id}`
}

export function generateApiKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  let body = ''
  for (let i = 0; i < arr.length; i++) body += chars[arr[i] % chars.length]
  return `teu-${body}`
}