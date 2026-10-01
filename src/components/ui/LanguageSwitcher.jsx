import { useLanguage } from '../../context/LanguageContext.jsx'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher({ variant = 'button' }) {
  const { lang, setLang, languages } = useLanguage()

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-white/10 dark:bg-white/5">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              lang === l.code
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            <span className="mr-1">{l.flag}</span>
            {l.code.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-indigo-400 hover:text-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-indigo-500"
        aria-label="Change language"
        title="Change language / Đổi ngôn ngữ"
      >
        <Globe size={14} />
        <span>{languages.find((l) => l.code === lang)?.flag}</span>
        <span>{languages.find((l) => l.code === lang)?.label}</span>
      </button>
    </div>
  )
}