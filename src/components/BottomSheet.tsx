import { useEffect, type ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        aria-label="Close sheet"
        onClick={onClose}
      />
      <section
        className="relative z-10 max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl sm:px-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
        <div className="flex min-h-11 items-center justify-between gap-4">
          <h2 id="sheet-title" className="text-xl font-bold text-slate-950">
            {title}
          </h2>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full bg-slate-100 text-xl text-slate-600"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
