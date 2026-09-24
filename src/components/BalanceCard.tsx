import { formatCurrency } from '../lib/currency'

interface BalanceCardProps {
  balance: number
  income: number
  expenses: number
  currency: string
}

export function BalanceCard({ balance, income, expenses, currency }: BalanceCardProps) {
  return (
    <section className="mx-5 overflow-hidden rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/15 sm:mx-7">
      <p className="text-sm font-medium text-slate-300">Total balance</p>
      <p className="mt-2 text-4xl font-bold tracking-tight">{formatCurrency(balance, currency)}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total income</p>
          <p className="mt-1 font-semibold text-emerald-400">{formatCurrency(income, currency)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total expenses</p>
          <p className="mt-1 font-semibold text-rose-400">{formatCurrency(expenses, currency)}</p>
        </div>
      </div>
    </section>
  )
}
