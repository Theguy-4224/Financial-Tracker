import { useMemo, useRef, useState } from 'react'
import type { Account, Category, Transaction } from '../db/types'
import { formatCurrency } from '../lib/currency'
import { formatDateHeading } from '../lib/date'

interface TransactionListProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  currency: string
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
  emptyTitle?: string
  emptyMessage?: string
}

export function TransactionList({
  transactions,
  accounts,
  categories,
  currency,
  onEdit,
  onDelete,
  emptyTitle = 'No transactions yet',
  emptyMessage = 'Tap + to record your first one.',
}: TransactionListProps) {
  const touchStartX = useRef(0)
  const [swipingId, setSwipingId] = useState<number>()
  const groups = useMemo(() => {
    const result = new Map<string, Transaction[]>()
    transactions.forEach((transaction) => {
      const group = result.get(transaction.date) ?? []
      group.push(transaction)
      result.set(transaction.date, group)
    })
    return [...result.entries()]
  }, [transactions])

  const accountById = new Map(accounts.map((account) => [account.id, account]))
  const categoryById = new Map(categories.map((category) => [category.id, category]))

  if (transactions.length === 0) {
    return (
      <div className="rounded-[1.75rem] bg-white px-5 py-10 text-center shadow-sm ring-1 ring-slate-200/80">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-2xl">🧾</div>
        <h2 className="mt-4 text-lg font-bold text-slate-950">{emptyTitle}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map(([date, items]) => (
        <section key={date}>
          <h2 className="mb-2 px-1 text-sm font-bold text-slate-500">{formatDateHeading(date)}</h2>
          <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200/80">
            {items.map((transaction, index) => {
              const category = transaction.categoryId
                ? categoryById.get(transaction.categoryId)
                : undefined
              const account = accountById.get(transaction.accountId)
              const receivingAccount = transaction.toAccountId
                ? accountById.get(transaction.toAccountId)
                : undefined
              const isSwiping = transaction.id === swipingId

              return (
                <div
                  key={transaction.id}
                  className={`relative flex items-center gap-3 p-4 ${index > 0 ? 'border-t border-slate-100' : ''} ${
                    isSwiping ? 'bg-rose-50' : ''
                  }`}
                  onTouchStart={(event) => {
                    touchStartX.current = event.touches[0].clientX
                  }}
                  onTouchMove={(event) => {
                    if (touchStartX.current - event.touches[0].clientX > 35) {
                      setSwipingId(transaction.id)
                    }
                  }}
                  onTouchEnd={(event) => {
                    const distance = touchStartX.current - event.changedTouches[0].clientX
                    setSwipingId(undefined)
                    if (distance > 75) onDelete(transaction)
                  }}
                >
                  <button
                    type="button"
                    className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() => onEdit(transaction)}
                  >
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-2xl text-xl"
                      style={{ backgroundColor: `${category?.color ?? '#64748b'}18` }}
                      aria-hidden="true"
                    >
                      {transaction.type === 'transfer' ? '↔️' : category?.icon ?? '✨'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-slate-800">
                        {transaction.note || (transaction.type === 'transfer' ? 'Transfer' : category?.name)}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-slate-500">
                        {transaction.type === 'transfer'
                          ? `${account?.name ?? 'Unknown'} → ${receivingAccount?.name ?? 'Unknown'}`
                          : account?.name ?? 'Unknown account'}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 text-right font-bold ${
                        transaction.type === 'income'
                          ? 'text-emerald-600'
                          : transaction.type === 'expense'
                            ? 'text-rose-600'
                            : 'text-slate-700'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '−' : ''}
                      {formatCurrency(transaction.amount, currency)}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="grid size-11 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Delete ${transaction.note || category?.name || 'transaction'}`}
                    onClick={() => onDelete(transaction)}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
