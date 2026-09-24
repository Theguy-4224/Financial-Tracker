import type { Budget, Category, Transaction } from '../db/types'
import { formatCurrency } from '../lib/currency'
import { isInMonth } from '../lib/date'

export interface BudgetProgressItem {
  budget: Budget
  category?: Category
  spent: number
  percentage: number
}

export function getBudgetProgress(
  budgets: Budget[],
  categories: Category[],
  transactions: Transaction[],
  month: string,
) {
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  return budgets
    .filter((budget) => budget.month === month)
    .map((budget) => {
      const spent = transactions
        .filter(
          (transaction) =>
            transaction.type === 'expense' &&
            transaction.categoryId === budget.categoryId &&
            isInMonth(transaction.date, month),
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0)
      return {
        budget,
        category: categoryById.get(budget.categoryId),
        spent,
        percentage: budget.limit > 0 ? (spent / budget.limit) * 100 : 0,
      }
    })
}

interface BudgetProgressProps {
  item: BudgetProgressItem
  currency: string
  onClick?: () => void
}

export function BudgetProgress({ item, currency, onClick }: BudgetProgressProps) {
  const remaining = item.budget.limit - item.spent
  const color = item.percentage >= 100 ? 'bg-rose-500' : item.percentage >= 80 ? 'bg-amber-500' : 'bg-blue-600'

  const content = (
    <>
      <div className="flex items-center gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl text-xl"
          style={{ backgroundColor: `${item.category?.color ?? '#64748b'}18` }}
          aria-hidden="true"
        >
          {item.category?.icon ?? '✨'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate font-bold text-slate-800">{item.category?.name ?? 'Unknown category'}</span>
            <span className="text-sm font-bold text-slate-600">{Math.round(item.percentage)}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(item.percentage, 100)}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-between gap-3 pl-13 text-xs font-semibold text-slate-500">
        <span>{formatCurrency(item.spent, currency)} of {formatCurrency(item.budget.limit, currency)}</span>
        <span className={remaining < 0 ? 'text-rose-600' : ''}>
          {remaining >= 0 ? `${formatCurrency(remaining, currency)} left` : `${formatCurrency(Math.abs(remaining), currency)} over`}
        </span>
      </div>
    </>
  )

  return onClick ? (
    <button type="button" className="min-h-20 w-full rounded-2xl bg-slate-50 p-3 text-left" onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className="rounded-2xl bg-slate-50 p-3">{content}</div>
  )
}
