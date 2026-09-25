import type { Subscription } from '../db/types'
import type { ReactNode } from 'react'
import { formatCurrency } from '../lib/currency'

function ProgressRing({ value, color, children }: { value: number; color: string; children: ReactNode }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100)
  return <div className="relative grid size-28 place-items-center"><svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true"><circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="9" className="text-slate-100 dark:text-slate-700"/><circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}/></svg><div className="absolute inset-3 grid place-items-center text-center">{children}</div></div>
}

interface FinanceWidgetsProps {
  income: number
  expenses: number
  subscriptions: Subscription[]
  today: Date
  currency: string
  onManageSubscriptions: () => void
}

export function FinanceWidgets({ income, expenses, subscriptions, today, currency, onManageSubscriptions }: FinanceWidgetsProps) {
  const cashFlow = income + expenses
  const spentPercent = cashFlow ? Math.round((expenses / cashFlow) * 100) : expenses ? 100 : 0
  const todayTime = today.getTime()
  const weekTime = todayTime + 7 * 86_400_000
  const active = subscriptions.filter((item) => item.status === 'active')
  const dueNow = active.filter((item) => new Date(`${item.nextBillingDate}T00:00:00`).getTime() <= todayTime)
  const dueSoon = active.filter((item) => { const time = new Date(`${item.nextBillingDate}T00:00:00`).getTime(); return time > todayTime && time <= weekTime })
  const next = [...active].sort((a, b) => a.nextBillingDate.localeCompare(b.nextBillingDate))[0]
  const ringValue = active.length ? Math.min(100, Math.round(((dueNow.length + dueSoon.length) / active.length) * 100)) : 0

  return <section className="grid gap-4 sm:grid-cols-2">
    <article className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80"><p className="text-sm font-semibold text-blue-600">THIS MONTH</p><div className="mt-3 flex items-center gap-4"><ProgressRing value={spentPercent} color="#f43f5e"><strong className="text-lg text-slate-950">{spentPercent}%</strong><span className="text-[11px] font-semibold text-slate-500">spent</span></ProgressRing><div className="min-w-0"><h2 className="text-lg font-bold text-slate-950">Total spent</h2><p className="mt-1 text-xl font-bold text-rose-600">{formatCurrency(expenses, currency)}</p><p className="mt-1 text-sm text-slate-500">of {formatCurrency(cashFlow, currency)} monthly cash flow</p></div></div></article>
    <article className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold text-blue-600">SUBSCRIPTIONS</p><h2 className="mt-1 text-lg font-bold text-slate-950">Renewal tracker</h2></div><button className="min-h-11 px-2 text-sm font-bold text-blue-700" onClick={onManageSubscriptions}>Manage</button></div><div className="mt-3 flex items-center gap-4"><ProgressRing value={ringValue} color={dueNow.length ? '#f43f5e' : dueSoon.length ? '#f59e0b' : '#2563eb'}><strong className="text-lg text-slate-950">{active.length}</strong><span className="text-[11px] font-semibold text-slate-500">active</span></ProgressRing><div className="min-w-0 flex-1">{dueNow.length ? <p className="font-bold text-rose-600">{dueNow.length} due now</p> : dueSoon.length ? <p className="font-bold text-amber-600">{dueSoon.length} due this week</p> : <p className="font-bold text-emerald-600">Nothing due this week</p>}<p className="mt-1 truncate text-sm text-slate-500">{next ? `Next: ${next.icon ?? '◌'} ${next.name} · ${next.nextBillingDate}` : 'Add a subscription to track renewals.'}</p></div></div></article>
  </section>
}
