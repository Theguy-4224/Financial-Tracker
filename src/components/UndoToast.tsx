interface UndoToastProps {
  message: string
  onUndo: () => void
  onDismiss: () => void
}

export function UndoToast({ message, onUndo, onDismiss }: UndoToastProps) {
  return (
    <div
      className="fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-2xl"
      role="status"
    >
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{message}</span>
      <button type="button" className="min-h-11 px-2 font-bold text-blue-300" onClick={onUndo}>
        Undo
      </button>
      <button type="button" className="grid size-11 place-items-center text-slate-400" aria-label="Dismiss" onClick={onDismiss}>
        ×
      </button>
    </div>
  )
}
