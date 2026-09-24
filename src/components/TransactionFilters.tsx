import type { Account, Category } from '../db/types'
import {
  EMPTY_TRANSACTION_FILTERS,
  type TransactionFilterState,
} from '../lib/transactionFilters'
import { BottomSheet } from './BottomSheet'

interface TransactionFiltersProps {
  open: boolean
  filters: TransactionFilterState
  accounts: Account[]
  categories: Category[]
  onChange: (filters: TransactionFilterState) => void
  onClose: () => void
}

export function TransactionFilters({
  open,
  filters,
  accounts,
  categories,
  onChange,
  onClose,
}: TransactionFiltersProps) {
  const invalidRange = Boolean(filters.startDate && filters.endDate && filters.startDate > filters.endDate)

  return (
    <BottomSheet open={open} title="Filter transactions" onClose={onClose}>
      <div className="space-y-4 py-4">
        <label className="block text-sm font-bold text-slate-700">
          Type
          <select
            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base"
            value={filters.type}
            onChange={(event) => onChange({ ...filters, type: event.target.value as TransactionFilterState['type'] })}
          >
            <option value="all">All types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
            <option value="transfer">Transfers</option>
          </select>
        </label>

        <label className="block text-sm font-bold text-slate-700">
          Category
          <select
            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base"
            value={filters.categoryId}
            onChange={(event) => onChange({ ...filters, categoryId: event.target.value === 'all' ? 'all' : Number(event.target.value) })}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-slate-700">
          Account
          <select
            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base"
            value={filters.accountId}
            onChange={(event) => onChange({ ...filters, accountId: event.target.value === 'all' ? 'all' : Number(event.target.value) })}
          >
            <option value="all">All accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-bold text-slate-700">
            From
            <input
              type="date"
              className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-3 text-base"
              value={filters.startDate}
              onInput={(event) => onChange({ ...filters, startDate: event.currentTarget.value })}
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            To
            <input
              type="date"
              className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-3 text-base"
              value={filters.endDate}
              onInput={(event) => onChange({ ...filters, endDate: event.currentTarget.value })}
            />
          </label>
        </div>

        {invalidRange && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">
            The start date must be before the end date.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="min-h-12 rounded-2xl bg-slate-100 px-4 font-bold text-slate-700"
            onClick={() => onChange({ ...EMPTY_TRANSACTION_FILTERS, query: filters.query })}
          >
            Clear filters
          </button>
          <button
            type="button"
            className="min-h-12 rounded-2xl bg-blue-600 px-4 font-bold text-white disabled:opacity-50"
            disabled={invalidRange}
            onClick={onClose}
          >
            Show results
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
