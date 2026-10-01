import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { uid, generateApiKey } from '../utils/format.js'

const AppContext = createContext(null)

const DEFAULT_SETTINGS = {
  defaultModel: 'gpt-4o',
  defaultTemperature: 0.7,
  notifications: {
    productUpdates: true,
    usageAlerts: true,
    weeklyReport: false,
  },
}

function seedNotifications() {
  const now = Date.now()
  const mk = (id, title, body, minsAgo, type = 'info') => ({
    id,
    title,
    body,
    time: new Date(now - minsAgo * 60000).toISOString(),
    type,
    read: false,
  })
  return [
    mk('n1', 'Usage alert', 'Daily token usage crossed 80% of your soft limit.', 32, 'warning'),
    mk('n2', 'New model available', 'GPT-5.1 is now active in your workspace.', 188, 'model'),
    mk('n3', 'Invoice ready', 'Your September invoice is available in Billing.', 1440, 'billing'),
    mk('n4', 'Performance update', 'Average latency improved by 12% over the last week.', 2900, 'info'),
  ]
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('tryeu:theme', 'dark')
  const [session, setSession] = useLocalStorage('tryeu:session', null)
  const [settings, setSettings] = useLocalStorage('tryeu:settings', DEFAULT_SETTINGS)
  const [apiKeys, setApiKeys] = useLocalStorage('tryeu:api-keys', [])
  const [chats, setChats] = useLocalStorage('tryeu:chats', [])
  const [activeChatId, setActiveChatId] = useLocalStorage('tryeu:active-chat', null)
  const [notifications, setNotifications] = useLocalStorage('tryeu:notifications', null)

  const [page, setPage] = useState('overview')
  const [toast, setToast] = useState(null)
  const [modelsSearch, setModelsSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toastTimer = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (notifications === null) setNotifications(seedNotifications())
  }, [notifications, setNotifications])

  const navigate = useCallback((nextPage) => {
    setPage(nextPage)
    setSidebarOpen(false)
    window.scrollTo({ top: 0 })
  }, [])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const dismissToast = useCallback(() => {
    setToast(null)
    if (toastTimer.current) clearTimeout(toastTimer.current)
  }, [])

  const signIn = useCallback(
    (profile) => {
      setSession({ name: profile.name || 'Anonymous User', email: profile.email || '', company: profile.company || '' })
      showToast(`Welcome back, ${profile.name || 'there'}!`)
    },
    [setSession, showToast],
  )

  const signOut = useCallback(() => {
    setSession(null)
    setPage('overview')
    showToast('Signed out.', 'info')
  }, [setSession, showToast])

  const updateSettings = useCallback(
    (patch) => {
      setSettings((prev) => ({ ...prev, ...patch }))
      showToast('Settings saved.')
    },
    [setSettings, showToast],
  )

  const createKey = useCallback(
    (name) => {
      const now = new Date().toISOString()
      const key = {
        id: uid('key'),
        name,
        key: generateApiKey(),
        created: now,
        lastUsed: null,
        status: 'active',
        used: Math.floor(Math.random() * 1200),
      }
      setApiKeys((prev) => [key, ...prev])
      return key
    },
    [setApiKeys],
  )

  const revokeKey = useCallback(
    (id) => {
      setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: 'revoked' } : k)))
    },
    [setApiKeys],
  )

  const deleteKey = useCallback(
    (id) => {
      setApiKeys((prev) => prev.filter((k) => k.id !== id))
    },
    [setApiKeys],
  )

  const resetAllData = useCallback(() => {
    const keys = [
      'tryeu:theme',
      'tryeu:session',
      'tryeu:settings',
      'tryeu:api-keys',
      'tryeu:chats',
      'tryeu:notifications',
    ]
    keys.forEach((k) => window.localStorage.removeItem(k))
    window.localStorage.setItem('tryeu:theme', JSON.stringify('dark'))
    window.location.reload()
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => (Array.isArray(prev) ? prev.map((n) => ({ ...n, read: true })) : prev))
  }, [setNotifications])

  const dismissNotification = useCallback(
    (id) => {
      setNotifications((prev) => (Array.isArray(prev) ? prev.filter((n) => n.id !== id) : prev))
    },
    [setNotifications],
  )

  const createChat = useCallback(
    (name, model) => {
      const chat = {
        id: uid('chat'),
        name: name || 'New conversation',
        model: model || settings.defaultModel || 'gpt-4o',
        createdAt: new Date().toISOString(),
        messages: [],
      }
      setChats((prev) => [chat, ...prev])
      setActiveChatId(chat.id)
      return chat
    },
    [setChats, setActiveChatId, settings.defaultModel],
  )

  const saveChat = useCallback(
    (chat) => {
      setChats((prev) => {
        const idx = prev.findIndex((c) => c.id === chat.id)
        if (idx === -1) return [chat, ...prev]
        const next = prev.slice()
        next[idx] = chat
        return next
      })
    },
    [setChats],
  )

  const deleteChat = useCallback(
    (id) => {
      setChats((prev) => prev.filter((c) => c.id !== id))
    },
    [setChats],
  )

  const updateChat = useCallback(
    ({ id, messages, model }) => {
      setChats((prev) => prev.map((c) => (c.id === id ? { ...c, messages: messages ?? c.messages, model: model ?? c.model } : c)))
    },
    [setChats],
  )

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      page,
      navigate,
      sidebarOpen,
      setSidebarOpen,
      toast,
      showToast,
      dismissToast,
      session,
      signIn,
      signOut,
      settings,
      updateSettings,
      apiKeys,
      createKey,
      revokeKey,
      deleteKey,
      chats,
      createChat,
      saveChat,
      deleteChat,
      updateChat,
      activeChatId,
      setActiveChatId,
      notifications: Array.isArray(notifications) ? notifications : [],
      markAllRead,
      dismissNotification,
      unreadCount,
      modelsSearch,
      setModelsSearch,
      resetAllData,
    }),
    [
      theme,
      page,
      navigate,
      sidebarOpen,
      setSidebarOpen,
      toast,
      showToast,
      dismissToast,
      session,
      signIn,
      signOut,
      settings,
      updateSettings,
      apiKeys,
      createKey,
      revokeKey,
      deleteKey,
      chats,
      createChat,
      saveChat,
      deleteChat,
      updateChat,
      activeChatId,
      setActiveChatId,
      notifications,
      markAllRead,
      dismissNotification,
      unreadCount,
      modelsSearch,
      setModelsSearch,
      resetAllData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}