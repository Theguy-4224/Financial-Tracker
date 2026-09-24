import { useMemo, useState, type FormEvent } from 'react'
import { deleteRecurring, saveRecurring, setRecurringActive } from '../db/actions'
import type { Account, Category, Frequency, Recurring } from '../db/types'
import { formatCurrency } from '../lib/currency'
import { todayInputValue } from '../lib/date'
import { BottomSheet } from './BottomSheet'

interface RecurringManagerProps {
  recurring: Recurring[]
  accounts: Account[]
  categories: Category[]
  currency: string
}

export function RecurringManager({ recurring, accounts, categories, currency }: RecurringManagerProps) {
  const [editing, setEditing] = useState<Recurring>()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [error, setError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number>()
  const visibleCategories = useMemo(
    () => categories.filter((category) => category.type === editing?.type),
    [categories, editing?.type],
  )

  function openRecurring(item?: Recurring) {
    const type = item?.type ?? 'expense'
    setEditing(
      item
        ? { ...item }
        : {
            type,
            amount: 0,
            categoryId: categories.find((category) => category.type === type)?.id ?? 0,
            accountId: accounts[0]?.id ?? 0,
            note: '',
            frequency: 'monthly',
            nextDate: todayInputValue(),
            active: true,
          },
    )
    setError('')
    setSheetOpen(true)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!editing) return
    try {
      await saveRecurring(editing)
      setSheetOpen(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the recurring transaction.')
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Recurring</h2>
          <p className="mt-1 text-sm text-slate-500">Automatically record weekly, monthly, or yearly items.</p>
        </div>
        <button type="button" className="min-h-11 rounded-2xl bg-blue-600 px-4 font-bold text-white" onClick={() => openRecurring()}>
          Add recurring
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {recurring.length > 0 ? (
          recurring.map((item) => {
            const category = categories.find((entry) => entry.id === item.categoryId)
            const account = accounts.find((entry) => entry.id === item.accountId)
            return (
              <article key={item.id} className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-xl" aria-hidden="true">
                    {category?.icon ?? '🔁'}
                  </span>
                  <button type="button" className="min-h-11 min-w-0 flex-1 text-left" onClick={() => openRecurring(item)}>
                    <span className="block truncate font-bold text-slate-800">{item.note || category?.name || 'Recurring transaction'}</span>
                    <span className="mt-1 block text-sm capitalize text-slate-500">
                      {item.frequency} · next {item.nextDate} · {account?.name ?? 'Unknown account'}
                    </span>
                  </button>
                  <span className={`shrink-0 font-bold ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>
                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    className={`min-h-11 flex-1 rounded-xl px-3 text-sm font-bold ${item.active ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}
                    onClick={() => item.id && void setRecurringActive(item.id, !item.active)}
                  >
                    {item.active ? 'Pause' : 'Resume'}
                  </button>
                  {confirmDeleteId === item.id ? (
                    <>
                      <button type="button" className="min-h-11 rounded-xl px-3 text-sm font-bold text-slate-500" onClick={() => setConfirmDeleteId(undefined)}>Cancel</button>
                      <button type="button" className="min-h-11 rounded-xl bg-rose-600 px-3 text-sm font-bold text-white" onClick={() => item.id && void deleteRecurring(item.id)}>Delete now</button>
                    </>
                  ) : (
                    <button type="button" className="min-h-11 rounded-xl px-3 text-sm font-bold text-rose-600" onClick={() => setConfirmDeleteId(item.id)}>Delete</button>
                  )}
                </div>
              </article>
            )
          })
        ) : (
          <button
            type="button"
            className="min-h-28 w-full rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500"
            onClick={() => openRecurring()}
          >
            No recurring transactions. Add one for regular income or expenses.
          </button>
        )}
      </div>

      <BottomSheet open={sheetOpen} title={editing?.id ? 'Edit recurring item' : 'Add recurring item'} onClose={() => setSheetOpen(false)}>
        {editing && (
          <form className="space-y-4 py-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
              {(['expense', 'income'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`min-h-11 rounded-xl text-sm font-bold capitalize ${editing.type === type ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                  onClick={() => setEditing({
                    ...editing,
                    type,
                    categoryId: categories.find((category) => category.type === type)?.id ?? 0,
                  })}
                >
                  {type}
                </button>
              ))}
            </div>
            <label className="block text-sm font-bold text-slate-700">
              Amount
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-base"
                value={editing.amount || ''}
                onChange={(event) => setEditing({ ...editing, amount: Number(event.target.value) })}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-slate-700">
                Category
                <select
                  className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base"
                  value={editing.categoryId}
                  onChange={(event) => setEditing({ ...editing, categoryId: Number(event.target.value) })}
                >
                  {visibleCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.icon} {category.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-bold text-slate-700">
                Account
                <select
                  className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base"
                  value={editing.accountId}
                  onChange={(event) => setEditing({ ...editing, accountId: Number(event.target.value) })}
                >
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-bold text-slate-700">
                Frequency
                <select
                  className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-base"
                  value={editing.frequency}
                  onChange={(event) => setEditing({ ...editing, frequency: event.target.value as Frequency })}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>
              <label className="block text-sm font-bold text-slate-700">
                Next date
                <input
                  type="date"
                  required
                  className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-3 text-base"
                  value={editing.nextDate}
                  onInput={(event) => setEditing({ ...editing, nextDate: event.currentTarget.value, anchorDay: Number(event.currentTarget.value.slice(8, 10)) })}
                />
              </label>
            </div>
            <label className="block text-sm font-bold text-slate-700">
              Note
              <input
                type="text"
                maxLength={100}
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-base"
                placeholder="Rent, salary, allowance…"
                value={editing.note}
                onChange={(event) => setEditing({ ...editing, note: event.target.value })}
              />
            </label>
            {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
            <button type="submit" className="min-h-12 w-full rounded-2xl bg-blue-600 px-4 font-bold text-white">Save recurring item</button>
          </form>
        )}
      </BottomSheet>
    </section>
  )
}
