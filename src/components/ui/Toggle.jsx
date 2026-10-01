export default function Toggle({ checked, onChange, disabled = false, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-white/15'
      }`}
    >
      <span
        className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5.5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}