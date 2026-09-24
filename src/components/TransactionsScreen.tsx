import { useMemo, useState } from 'react'
import type { Account, Category, Transaction } from '../db/types'
import {
  EMPTY_TRANSACTION_FILTERS,
  activeFilterCount,
  type TransactionFilterState,
} from '../lib/transactionFilters'
import { TransactionFilters } from './TransactionFilters'
import { TransactionList } from './TransactionList'

interface TransactionsScreenProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  currency: string
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

export function TransactionsScreen({
  transactions,
  accounts,
  categories,
  currency,
  onEdit,
  onDelete,
}: TransactionsScreenProps) {
  const [filters, setFilters] = useState<TransactionFilterState>(EMPTY_TRANSACTION_FILTERS)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const count = activeFilterCount(filters)

  const filteredTransactions = useMemo(() => {
    const query = filters.query.trim().toLocaleLowerCase()
    const accountById = new Map(accounts.map((account) => [account.id, account]))
    const categoryById = new Map(categories.map((category) => [category.id, category]))

    return transactions.filter((transaction) => {
      if (filters.type !== 'all' && transaction.type !== filters.type) return false
      if (filters.categoryId !== 'all' && transaction.categoryId !== filters.categoryId) return false
      if (
        filters.accountId !== 'all' &&
        transaction.accountId !== filters.accountId &&
        transaction.toAccountId !== filters.accountId
      ) {
        return false
      }
      if (filters.startDate && transaction.date < filters.startDate) return false
      if (filters.endDate && transaction.date > filters.endDate) return false

      if (query) {
        const searchable = [
          transaction.note,
          transaction.type,
          transaction.categoryId ? categoryById.get(transaction.categoryId)?.name : 'transfer',
          accountById.get(transaction.accountId)?.name,
          transaction.toAccountId ? accountById.get(transaction.toAccountId)?.name : '',
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase()
        if (!searchable.includes(query)) return false
      }

      return true
    })
  }, [accounts, categories, filters, transactions])

  const hasFilters = count > 0 || Boolean(filters.query)

  return (
    <main className="px-5 pb-6 sm:px-7">
      <div className="mb-5 flex gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search transactions</span>
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-base shadow-sm"
            placeholder="Search notes, categories, accounts"
            value={filters.query}
            onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          />
        </label>
        <button
          type="button"
          className={`relative min-h-12 rounded-2xl px-4 font-bold ring-1 ${
            count > 0
              ? 'bg-blue-600 text-white ring-blue-600'
              : 'bg-white text-slate-700 ring-slate-200'
          }`}
          onClick={() => setFilterSheetOpen(true)}
        >
          Filters
          {count > 0 && (
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs" aria-label={`${count} active filters`}>
              {count}
            </span>
          )}
        </button>
      </div>

      <div className="mb-4 flex min-h-8 items-center justify-between gap-3 px-1">
        <p className="text-sm font-semibold text-slate-500">
          {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
        </p>
        {hasFilters && (
          <button
            type="button"
            className="min-h-11 px-2 text-sm font-bold text-blue-700"
            onClick={() => setFilters(EMPTY_TRANSACTION_FILTERS)}
          >
            Clear all
          </button>
        )}
      </div>

      <TransactionList
        transactions={filteredTransactions}
        accounts={accounts}
        categories={categories}
        currency={currency}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyTitle={hasFilters ? 'No matching transactions' : undefined}
        emptyMessage={hasFilters ? 'Try changing your search or filters.' : undefined}
      />

      <TransactionFilters
        open={filterSheetOpen}
        filters={filters}
        accounts={accounts}
        categories={categories}
        onChange={setFilters}
        onClose={() => setFilterSheetOpen(false)}
      />
    </main>
  )
}
