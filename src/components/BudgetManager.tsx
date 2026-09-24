import { useMemo, useState, type FormEvent } from 'react'
import { deleteBudget, saveBudget } from '../db/actions'
import type { Budget, Category, Transaction } from '../db/types'
import { currentMonthKey, formatMonth } from '../lib/date'
import { BottomSheet } from './BottomSheet'
import { BudgetProgress, getBudgetProgress } from './BudgetProgress'
import { MonthSelector } from './MonthSelector'

interface BudgetManagerProps {
  budgets: Budget[]
  categories: Category[]
  transactions: Transaction[]
  currency: string
  initialMonth: string
}

export function BudgetManager({ budgets, categories, transactions, currency, initialMonth }: BudgetManagerProps) {
  const [month, setMonth] = useState(initialMonth || currentMonthKey())
  const [editing, setEditing] = useState<Budget>()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [error, setError] = useState('')
  const expenseCategories = categories.filter((category) => category.type === 'expense')
  const progress = useMemo(
    () => getBudgetProgress(budgets, categories, transactions, month),
    [budgets, categories, month, transactions],
  )

  function openBudget(budget?: Budget) {
    setEditing(
      budget
        ? { ...budget }
        : { categoryId: expenseCategories[0]?.id ?? 0, month, limit: 0 },
    )
    setError('')
    setSheetOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!editing) return
    try {
      await saveBudget(editing)
      setSheetOpen(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the budget.')
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Budgets</h2>
          <p className="mt-1 text-sm text-slate-500">Set monthly limits by expense category.</p>
        </div>
        <button type="button" className="min-h-11 rounded-2xl bg-blue-600 px-4 font-bold text-white" onClick={() => openBudget()}>
          Add budget
        </button>
      </div>

      <div className="-mx-5 mt-5 sm:-mx-7">
        <MonthSelector month={month} onChange={setMonth} />
      </div>

      <div className="space-y-3">
        {progress.length > 0 ? (
          progress.map((item) => (
            <div key={item.budget.id} className="rounded-[1.5rem] bg-white p-3 shadow-sm ring-1 ring-slate-200/80">
              <BudgetProgress item={item} currency={currency} onClick={() => openBudget(item.budget)} />
              <button
                type="button"
                className="mt-1 min-h-11 w-full text-sm font-bold text-rose-600"
                onClick={() => item.budget.id && void deleteBudget(item.budget.id)}
              >
                Remove budget
              </button>
            </div>
          ))
        ) : (
          <button
            type="button"
            className="min-h-28 w-full rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500"
            onClick={() => openBudget()}
          >
            No budgets for {formatMonth(month)}. Add one to track spending progress.
          </button>
        )}
      </div>

      <BottomSheet open={sheetOpen} title={editing?.id ? 'Edit budget' : 'Add budget'} onClose={() => setSheetOpen(false)}>
        {editing && (
          <form className="space-y-4 py-4" onSubmit={(event) => void handleSubmit(event)}>
            <label className="block text-sm font-bold text-slate-700">
              Category
              <select
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base"
                value={editing.categoryId}
                onChange={(event) => setEditing({ ...editing, categoryId: Number(event.target.value) })}
              >
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.icon} {category.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Month
              <input
                type="month"
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-base"
                value={editing.month}
                onInput={(event) => setEditing({ ...editing, month: event.currentTarget.value })}
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Limit
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-base"
                value={editing.limit || ''}
                onChange={(event) => setEditing({ ...editing, limit: Number(event.target.value) })}
              />
            </label>
            {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
            <button type="submit" className="min-h-12 w-full rounded-2xl bg-blue-600 px-4 font-bold text-white">Save budget</button>
          </form>
        )}
      </BottomSheet>
    </section>
  )
}
