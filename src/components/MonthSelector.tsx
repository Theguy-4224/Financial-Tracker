import { formatMonth, shiftMonth } from '../lib/date'

interface MonthSelectorProps {
  month: string
  onChange: (month: string) => void
}

export function MonthSelector({ month, onChange }: MonthSelectorProps) {
  return (
    <div className="mx-5 mb-4 flex items-center justify-between rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200/80 sm:mx-7">
      <button
        type="button"
        className="grid size-11 place-items-center rounded-xl text-xl font-bold text-slate-500 hover:bg-slate-100"
        aria-label="Previous month"
        onClick={() => onChange(shiftMonth(month, -1))}
      >
        ‹
      </button>
      <p className="font-bold text-slate-800">{formatMonth(month)}</p>
      <button
        type="button"
        className="grid size-11 place-items-center rounded-xl text-xl font-bold text-slate-500 hover:bg-slate-100"
        aria-label="Next month"
        onClick={() => onChange(shiftMonth(month, 1))}
      >
        ›
      </button>
    </div>
  )
}
