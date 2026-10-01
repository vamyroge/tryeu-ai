import { useEffect, useRef, useState } from 'react'

export default function Dropdown({ trigger, children, align = 'right', width = 'w-60', className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={ref} className={`relative ${className}`}>
      {typeof trigger === 'function' ? trigger(() => setOpen((o) => !o)) : trigger}
      {open && (
        <div
          className={`absolute z-40 mt-2 ${width} ${align === 'right' ? 'right-0' : 'left-0'} animate-pop-in origin-top overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0e131c]`}
        >
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  )
}