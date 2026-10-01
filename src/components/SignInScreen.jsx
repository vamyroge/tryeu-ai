import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import Logo from './ui/Logo.jsx'
import LanguageSwitcher from './ui/LanguageSwitcher.jsx'
import { CheckCircle2, ShieldCheck, FileCode2, ChartLine } from 'lucide-react'

const FEATURES = [
  { icon: ChartLine, titleKey: 'signin.feature1Title', descKey: 'signin.feature1Desc' },
  { icon: FileCode2, titleKey: 'signin.feature2Title', descKey: 'signin.feature2Desc' },
  { icon: ShieldCheck, titleKey: 'signin.feature3Title', descKey: 'signin.feature3Desc' },
]

export default function SignInScreen() {
  const { signIn } = useApp()
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const submit = (e) => {
    e.preventDefault()
    signIn({ name: name.trim(), email: email.trim() })
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Logo size={34} />
            <div className="font-bold tracking-tight text-white">
              TRYEU <span className="text-white/70">AI</span>
            </div>
          </div>
          <h1 className="mt-16 max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
            {t('signin.heroTitle')}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            {t('signin.heroSubtitle')}
          </p>
          <ul className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, titleKey, descKey }) => (
              <li key={titleKey} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon size={17} className="text-white" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">{t(titleKey)}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-white/60">{t(descKey)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-xs text-white/50">{t('signin.trusted')}</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-[#070b11]">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <Logo size={32} />
              <div className="text-lg font-bold tracking-tight">
                TRYEU <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">AI</span>
              </div>
            </div>
            <div className="ml-auto">
              <LanguageSwitcher variant="inline" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{t('signin.welcome')}</h2>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{t('signin.welcomeSub')}</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('signin.fullName')}</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('signin.fullNamePlaceholder')}
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('signin.workEmail')}</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('signin.workEmailPlaceholder')}
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400"
            >
              {t('signin.continue')}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-zinc-400">
              <CheckCircle2 size={12} className="text-emerald-500" />
              {t('signin.trial')}
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}