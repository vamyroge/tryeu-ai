import { MODELS, getModel } from '../data/models.js'

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const baseWeights = {
  'gpt-4o': 0.22,
  'gpt-4o-mini': 0.34,
  'gpt-o3': 0.08,
  'claude-4-5-sonnet': 0.14,
  'claude-4-opus': 0.02,
  'claude-3-7-haiku': 0.16,
  'gemini-2.5-pro': 0.06,
  'gemini-2.5-flash': 0.12,
  'qwen-2.5-max': 0.05,
  'deepseek-v3': 0.12,
  'deepseek-r1': 0.03,
  'llama-3.3-70b': 0.05,
  'glm-4.5-plus': 0.04,
  'kimi-k2': 0.05,
  'grok-4': 0.01,
}

const totalWeight = Object.values(baseWeights).reduce((a, b) => a + b, 0)

function pickModel(rnd) {
  let r = rnd() * totalWeight
  for (const [id, w] of Object.entries(baseWeights)) {
    r -= w
    if (r <= 0) return id
  }
  return 'gpt-4o-mini'
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function makeDay(date, rnd) {
  const byModel = {}
  const total = { requests: 0, tokens: 0, cost: 0, latencySum: 0, latencyCount: 0 }

  const reqCount = Math.round(1800 + rnd() * 3200)
  for (let i = 0; i < reqCount; i++) {
    const id = pickModel(rnd)
    const model = getModel(id)
    if (!model) continue
    const bin = byModel[id] || (byModel[id] = { requests: 0, tokens: 0, cost: 0, latencySum: 0, latencyCount: 0 })
    const tokens = Math.round(model.contextWindow <= 50000 ? 400 + rnd() * 1600 : 900 + rnd() * 3200)
    const latency = Math.max(80, Math.round(model.latency * (0.35 + rnd() * 0.9)))
    bin.requests += 1
    bin.tokens += tokens
    bin.cost += (tokens / 1e6) * model.inputPrice * 0.62 + (tokens / 1e6) * model.outputPrice * 0.2
    bin.latencySum += latency
    bin.latencyCount += 1
  }

  for (const [id, bin] of Object.entries(byModel)) {
    const model = getModel(id)
    total.requests += bin.requests
    total.tokens += bin.tokens
    total.cost += bin.cost
    total.latencySum += bin.latencySum
    total.latencyCount += bin.latencyCount
    bin.latency = bin.latencyCount ? bin.latencySum / bin.latencyCount : 0
    bin.cost = Math.round(bin.cost * 100) / 100
    byModel[id] = { requests: bin.requests, tokens: bin.tokens, cost: bin.cost, latency: bin.latency }
  }

  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    totalRequests: total.requests,
    totalTokens: total.tokens,
    totalCost: Math.round(total.cost * 100) / 100,
    avgLatency: total.latencyCount ? Math.round(total.latencySum / total.latencyCount) : 0,
    byModel,
  }
}

export function buildDailyData(days = 90) {
  const rnd = mulberry32(20260916)
  const out = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    out.push(makeDay(d, rnd))
  }
  return out
}

const STATUSES = ['success', 'success', 'success', 'success', 'error', 'success', 'rate_limited', 'success']

export function buildRecentRequests(count = 14) {
  const rnd = mulberry32(7777)
  const now = new Date()
  const rows = []
  for (let i = 0; i < count; i++) {
    const model = getModel(pickModel(rnd))
    const t = new Date(now)
    t.setMinutes(t.getMinutes() - i * 9 - Math.round(rnd() * 7))
    const tokens = Math.round(300 + rnd() * 2800)
    const latency = Math.max(60, Math.round(model.latency * (0.3 + rnd() * 0.8)))
    const status = STATUSES[Math.floor(rnd() * STATUSES.length)]
    rows.push({
      id: `req-${now.getTime()}-${i}`,
      time: t,
      model: model.id,
      tokens,
      latency,
      status,
      cost: ((tokens / 1e6) * model.inputPrice * 0.6 + (tokens / 1e6) * model.outputPrice * 0.2).toFixed(4),
    })
  }
  return rows
}

export const MOCK_RESPONSES = {
  'gpt-4o':
    'That\u2019s a great question. Here\u2019s how I\u2019d break it down:\n\n1. **Start small** — ship a minimal version and measure real usage before optimizing.\n2. **Watch the context** — long conversations drift; trim or summarize history.\n3. **Instrument everything** — log latency, token drift and cost per request.\n\nIf you share a specific scenario, I can turn this into a concrete plan with metrics to track.',
  'gpt-4o-mini':
    'Happy to help! Based on what you described, the fastest path is:\n\n- Use a caching layer for repeatable responses\n- Batch small API calls into one\n- Measure cost per request from day one\n\nWant me to sketch the exact implementation steps?',
  'gpt-o3':
    'Let me reason through this problem step by step.\n\n**Goal.** We need a solution that is both robust and cheap to operate.\n\n**Constraints observed from your prompt:**\n- Latency budget under 2s\n- Must handle concurrent users\n- No external services allowed\n\n**Recommended architecture:**\n1. Route by input size — small payloads to a fast model, large ones to a deep reasoner.\n2. Use deterministic tooling + structured outputs where answers are cached.\n3. Add a fallback chain when the primary provider is rate-limited.\n\nI\u2019ve considered 4 alternatives; this design meets all constraints with lowest expected cost.',
  'claude-4-5-sonnet':
    'Taking a measured approach here. The core tension is between response quality and operating cost.\n\nWhat works well in practice:\n- Route simple, repetitive traffic to `claude-3-7-haiku`\n- Keep `claude-4-5-sonnet` for nuanced conversations\n- Store conversation summaries instead of full transcripts\n\nI can draft the routing rules if useful — just describe your traffic mix.',
  'claude-4-opus':
    'This is a genuinely hard problem, so let\u2019s be careful.\n\nI\u2019ll separate the requirements into **must-haves** and **nice-to-haves**, then propose a staged implementation that starts with the highest-leverage item. The key insight is that most failure modes in your current setup come from coupling too many concerns into a single model call — splitting the pipeline into a planner + executor reduces error rates dramatically.\n\nShall I walk through each stage with concrete payload examples?',
  'claude-3-7-haiku':
    'Quick answer: yes, and here\u2019s the pattern most teams use.\n\n```\nGET /v1/models\nPOST /v1/chat/completions\n```\n\nOne endpoint with a `model` field keeps clients simple. Add retries with exponential backoff and you\u2019re production-ready. Need the failure-handling pseudocode next?',
  'gemini-2.5-pro':
    'Understanding this from the ground up:\n\nYour dataset spans multiple domains, so a single prompt template won\u2019t generalize. I\u2019d:\n\n1. Embed documents once and store them locally\n2. Retrieve the top-N chunks per query\n3. Pass chunks into the model with grounding instructions\n\nThis keeps quality high while staying fully offline and cheap. I can provide the retrieval scoring function if you want.',
  'gemini-2.5-flash':
    'Straightforward setup:\n\n1. Create a project\n2. Add an API key\n3. Call the model with `temperature: 0.7`\n\nWorks great for real-time docs Q&A. Want me to write the request JSON?',
  'qwen-2.5-max':
    '好的，我已经理解了你的需求。\n\nFor the bilingual build you described, I recommend a two-tier approach:\n- Chinese content: GLM or Qwen handle tone better\n- English content: keep GPT/Claude\n\nCombine with a shared retrieval layer and you get both quality and cost savings.',
  'deepseek-v3':
    'Cheapest reliable route for that workload:\n\n1. Cache prompt prefixes to slash input-token costs\n2. Use structured outputs to avoid retries\n3. Monitor cost per 1K tokens across providers weekly\n\nCost typically drops 40–60% with just the prefix cache.',
  'deepseek-r1':
    'Let me think carefully.\n\n*User wants a robust, low-cost pipeline.*\n\nPossible approaches:\n- **A) Single frontier model** — simplest, priciest.\n- **B) Small model + retrieval** — cheaper, needs plumbing.\n- **C) Hybrid routing** — best balance.\n\nGiven constraints, **B with a routing layer** wins: small model answers fast, escalates to a reasoner only when confidence is low. Estimated savings: ~55% of current spend.',
  'llama-3.3-70b':
    'Sure! A pragmatic pattern for self-hosted setups:\n\n- Serve via a small proxy that caps concurrency\n- Clip the prompt to the most recent N turns\n- Batch identical prefixes\n\nThat usually doubles throughput on consumer GPUs. What\u2019s your serving hardware?',
  'glm-4.5-plus':
    '对于中文工作流，我推荐：\n\n1. 用 GLM 处理长文档总结与结构化抽取\n2. 关键词命中走缓存，减少重复调用\n3. 通用对话交给轻量模型，省钱也够快\n\n需要我给你一份具体的代码示例吗？',
  'kimi-k2':
    'Here\u2019s a clean agentic skeleton for that task:\n\n```\nschedule(\n  plan(model: planner),\n  execute(code: model),\n  verify(tests: model),\n  report()\n)\n```\n\nEach stage pins its own model so you can swap providers without touching business logic. Want the async orchestration version with retries?',
  'grok-4':
    'My take: you\u2019re overthinking the plumbing. Ship raw, measure, then carve out hot paths. Real-time telemetry will tell you exactly which model to keep and which to demote — don\u2019t guess. And keep the escape hatch: one env var switches the whole pipeline to a cheaper model.',
}

export function getMockResponse(modelId, prompt) {
  let text = MOCK_RESPONSES[modelId]
  if (!text) {
    text =
      'Good question. Here is a concise, practical answer tailored to your setup:\n\nFocus on the highest-leverage lever first, instrument everything, and iterate weekly. If you share the exact failure you\u2019re hitting, I can narrow the options to two and recommend one.'
  }
  const mention = prompt.trim().split(/\s+/).slice(0, 6).join(' ')
  text = `On \u201c${mention}\u201d — ${text.trim()}`
  return text
}

export function simulateTyping(text, onChar, onDone, chunk = 6) {
  const words = text.split(/(\s+)/)
  let i = 0
  const timer = setInterval(() => {
    let added = ''
    for (let c = 0; c < chunk && i < words.length; c++) {
      added += words[i]
      i++
    }
    if (added) onChar(added)
    if (i >= words.length) {
      clearInterval(timer)
      onDone()
    }
  }, 14)
  return () => clearInterval(timer)
}