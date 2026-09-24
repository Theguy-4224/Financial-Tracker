interface DatabaseStatusProps {
  status: 'loading' | 'ready' | 'error'
  message: string
}

export function DatabaseStatus({ status, message }: DatabaseStatusProps) {
  const styles = {
    loading: 'bg-amber-50 text-amber-800 ring-amber-200',
    ready: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    error: 'bg-rose-50 text-rose-800 ring-rose-200',
  }

  return (
    <div
      className={`flex min-h-11 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ring-1 ${styles[status]}`}
      role={status === 'error' ? 'alert' : 'status'}
    >
      <span
        className={`size-2.5 shrink-0 rounded-full ${
          status === 'loading'
            ? 'animate-pulse bg-amber-500'
            : status === 'ready'
              ? 'bg-emerald-500'
              : 'bg-rose-500'
        }`}
        aria-hidden="true"
      />
      {message}
    </div>
  )
}
