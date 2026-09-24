import { formatCurrency } from '../lib/currency'

interface MonthlySummaryProps {
  income: number
  expenses: number
  currency: string
}

export function MonthlySummary({ income, expenses, currency }: MonthlySummaryProps) {
  const net = income - expenses
  const cards = [
    { label: 'Income', value: income, style: 'bg-emerald-50 text-emerald-700' },
    { label: 'Expenses', value: expenses, style: 'bg-rose-50 text-rose-700' },
    { label: 'Balance', value: net, style: net >= 0 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700' },
  ]

  return (
    <section className="grid grid-cols-3 gap-2">
      {cards.map((card) => (
        <div key={card.label} className={`min-w-0 rounded-2xl p-3 sm:p-4 ${card.style}`}>
          <p className="text-xs font-bold uppercase tracking-wide opacity-70">{card.label}</p>
          <p className="mt-2 truncate text-sm font-bold sm:text-base" title={formatCurrency(card.value, currency)}>
            {formatCurrency(card.value, currency)}
          </p>
        </div>
      ))}
    </section>
  )
}
