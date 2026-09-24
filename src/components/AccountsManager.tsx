import { useState, type FormEvent } from 'react'
import { deleteAccount, saveAccount } from '../db/actions'
import type { Account, AccountType, Transaction } from '../db/types'
import { formatCurrency } from '../lib/currency'
import { getAccountBalance } from '../lib/finance'
import { BottomSheet } from './BottomSheet'

interface AccountsManagerProps {
  accounts: Account[]
  transactions: Transaction[]
  currency: string
}

const emptyAccount: Account = {
  name: '',
  type: 'cash',
  startingBalance: 0,
  color: '#2563eb',
}

export function AccountsManager({ accounts, transactions, currency }: AccountsManagerProps) {
  const [editing, setEditing] = useState<Account>()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [error, setError] = useState('')

  function openAccount(account?: Account) {
    setEditing(account ? { ...account } : { ...emptyAccount })
    setError('')
    setSheetOpen(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    try {
      await saveAccount(editing)
      setSheetOpen(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the account.')
    }
  }

  async function handleDelete(account: Account) {
    if (!account.id) return
    setError('')
    try {
      await deleteAccount(account.id)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete the account.')
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Accounts</h2>
          <p className="mt-1 text-sm text-slate-500">Cash, bank, e-wallet, or credit card.</p>
        </div>
        <button
          type="button"
          className="min-h-11 rounded-2xl bg-blue-600 px-4 font-bold text-white"
          onClick={() => openAccount()}
        >
          Add account
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {accounts.length === 0 ? (
          <button
            type="button"
            className="min-h-28 w-full rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-white p-5 text-center text-sm font-semibold text-slate-500"
            onClick={() => openAccount()}
          >
            Add your first account to start tracking money.
          </button>
        ) : (
          accounts.map((account) => (
            <article
              key={account.id}
              className="flex items-center gap-3 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200/80"
            >
              <span className="size-3 rounded-full" style={{ backgroundColor: account.color }} />
              <button type="button" className="min-h-11 min-w-0 flex-1 text-left" onClick={() => openAccount(account)}>
                <span className="block truncate font-bold text-slate-800">{account.name}</span>
                <span className="block text-sm capitalize text-slate-500">{account.type.replace('-', ' ')}</span>
              </button>
              <span className="font-bold text-slate-800">
                {formatCurrency(getAccountBalance(account, transactions), currency)}
              </span>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label={`Delete ${account.name}`}
                onClick={() => void handleDelete(account)}
              >
                ×
              </button>
            </article>
          ))
        )}
      </div>

      <BottomSheet
        open={sheetOpen}
        title={editing?.id ? 'Edit account' : 'Add account'}
        onClose={() => setSheetOpen(false)}
      >
        {editing && (
          <form className="space-y-4 py-4" onSubmit={(event) => void handleSubmit(event)}>
            <label className="block text-sm font-bold text-slate-700">
              Account name
              <input
                autoFocus
                required
                maxLength={40}
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-base"
                value={editing.name}
                onChange={(event) => setEditing({ ...editing, name: event.target.value })}
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Type
              <select
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base"
                value={editing.type}
                onChange={(event) => setEditing({ ...editing, type: event.target.value as AccountType })}
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="e-wallet">E-wallet</option>
                <option value="credit-card">Credit card</option>
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Starting balance
              <input
                type="number"
                step="0.01"
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-base"
                value={editing.startingBalance}
                onChange={(event) => setEditing({ ...editing, startingBalance: Number(event.target.value) })}
              />
            </label>
            <label className="flex min-h-12 items-center justify-between rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700">
              Account color
              <input
                type="color"
                className="size-9 rounded-lg border-0 bg-transparent"
                value={editing.color}
                onChange={(event) => setEditing({ ...editing, color: event.target.value })}
              />
            </label>
            {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
            <button type="submit" className="min-h-12 w-full rounded-2xl bg-blue-600 px-4 font-bold text-white">
              Save account
            </button>
          </form>
        )}
      </BottomSheet>
    </section>
  )
}
