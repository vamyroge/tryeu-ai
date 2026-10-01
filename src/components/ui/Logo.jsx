export default function Logo({ size = 30 }) {
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L14.2 7.2L19.6 8.4L15.8 12.6L16 18L12 15.4L8 18L8.2 12.6L4.4 8.4L9.8 7.2L12 2Z" fill="white" />
        <circle cx="18.6" cy="17.4" r="1.6" fill="white" fillOpacity="0.65" />
        <circle cx="5.2" cy="17.9" r="1.1" fill="white" fillOpacity="0.5" />
      </svg>
    </div>
  )
}