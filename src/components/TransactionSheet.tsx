import { useEffect, useMemo, useState } from 'react'
import { saveTransaction } from '../db/actions'
import type { Account, Category, Transaction, TransactionType } from '../db/types'
import { todayInputValue } from '../lib/date'
import { BottomSheet } from './BottomSheet'

interface TransactionSheetProps {
  open: boolean
  accounts: Account[]
  categories: Category[]
  transaction?: Transaction
  onClose: () => void
  onSaved: () => void
}

const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫']

export function TransactionSheet({
  open,
  accounts,
  categories,
  transaction,
  onClose,
  onSaved,
}: TransactionSheetProps) {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [accountId, setAccountId] = useState<number | undefined>()
  const [toAccountId, setToAccountId] = useState<number | undefined>()
  const [date, setDate] = useState(todayInputValue())
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  )

  useEffect(() => {
    if (!open) return
    const nextType = transaction?.type ?? 'expense'
    setType(nextType)
    setAmount(transaction ? String(transaction.amount) : '')
    setCategoryId(
      transaction?.categoryId ?? categories.find((category) => category.type === nextType)?.id,
    )
    setAccountId(transaction?.accountId ?? accounts[0]?.id)
    setToAccountId(
      transaction?.toAccountId ?? accounts.find((account) => account.id !== accounts[0]?.id)?.id,
    )
    setDate(transaction?.date ?? todayInputValue())
    setNote(transaction?.note ?? '')
    setError('')
  }, [accounts, categories, open, transaction])

  function selectType(nextType: TransactionType) {
    setType(nextType)
    setCategoryId(categories.find((category) => category.type === nextType)?.id)
    setError('')
  }

  function pressKey(key: string) {
    if (key === '⌫') {
      setAmount((current) => current.slice(0, -1))
      return
    }
    setAmount((current) => {
      if (key === '.' && current.includes('.')) return current
      if (key === '.' && current === '') return '0.'
      if (current.includes('.') && current.split('.')[1]?.length >= 2) return current
      if (current === '0' && key !== '.') return key
      return `${current}${key}`.slice(0, 12)
    })
  }

  async function handleSave(addAnother: boolean) {
    if (!accountId) {
      setError('Add an account in Settings before saving a transaction.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await saveTransaction({
        id: transaction?.id,
        type,
        amount: Number(amount),
        categoryId,
        accountId,
        toAccountId,
        date,
        note,
        recurringId: transaction?.recurringId,
        subscriptionId: transaction?.subscriptionId,
      })
      onSaved()
      if (addAnother && !transaction) {
        setAmount('')
        setNote('')
        setError('Saved. Add the next transaction.')
      } else {
        onClose()
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the transaction.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet open={open} title={transaction ? 'Edit transaction' : 'Add transaction'} onClose={onClose}>
      <div className="pb-2 pt-3">
        <div className="grid grid-cols-3 rounded-2xl bg-slate-100 p-1" aria-label="Transaction type">
          {(['expense', 'income', 'transfer'] as TransactionType[]).map((option) => (
            <button
              key={option}
              type="button"
              className={`min-h-11 rounded-xl px-2 text-sm font-bold capitalize transition ${
                type === option ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
              }`}
              onClick={() => selectType(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="py-5 text-center">
          <p className="text-sm font-semibold text-slate-500">Amount</p>
          <div className="mt-1 min-h-12 text-4xl font-bold tracking-tight text-slate-950">
            <span className="mr-2 text-2xl text-slate-400">RM</span>
            {amount || '0'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {keypad.map((key) => (
            <button
              key={key}
              type="button"
              className="min-h-12 rounded-2xl bg-slate-100 text-xl font-bold text-slate-800 active:bg-slate-200"
              onClick={() => pressKey(key)}
            >
              {key}
            </button>
          ))}
        </div>

        {type !== 'transfer' && (
          <fieldset className="mt-5">
            <legend className="text-sm font-bold text-slate-700">Category</legend>
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`min-h-20 rounded-2xl p-2 text-center ring-2 transition ${
                    categoryId === category.id
                      ? 'bg-blue-50 text-blue-800 ring-blue-500'
                      : 'bg-slate-50 text-slate-600 ring-transparent'
                  }`}
                  onClick={() => setCategoryId(category.id)}
                >
                  <span className="block text-2xl" aria-hidden="true">
                    {category.icon}
                  </span>
                  <span className="mt-1 block truncate text-xs font-semibold">{category.name}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">
            {type === 'transfer' ? 'From account' : 'Account'}
            <select
              className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium"
              value={accountId ?? ''}
              onChange={(event) => setAccountId(Number(event.target.value) || undefined)}
            >
              <option value="">Choose an account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>

          {type === 'transfer' && (
            <label className="text-sm font-bold text-slate-700">
              To account
              <select
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium"
                value={toAccountId ?? ''}
                onChange={(event) => setToAccountId(Number(event.target.value) || undefined)}
              >
                <option value="">Choose an account</option>
                {accounts
                  .filter((account) => account.id !== accountId)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
              </select>
            </label>
          )}

          <label className="text-sm font-bold text-slate-700">
            Date
            <input
              type="date"
              className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-bold text-slate-700">
          Note <span className="font-normal text-slate-400">(optional)</span>
          <input
            type="text"
            maxLength={100}
            className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-base"
            placeholder={type === 'transfer' ? 'What is this transfer for?' : 'Lunch, groceries, payday…'}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>

        {error && (
          <p
            className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
              error.startsWith('Saved')
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
            role="status"
          >
            {error}
          </p>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="min-h-12 rounded-2xl bg-blue-600 px-4 font-bold text-white shadow-lg shadow-blue-600/20 disabled:opacity-50"
            disabled={saving}
            onClick={() => void handleSave(false)}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {!transaction && (
            <button
              type="button"
              className="min-h-12 rounded-2xl bg-blue-50 px-4 font-bold text-blue-700 disabled:opacity-50"
              disabled={saving}
              onClick={() => void handleSave(true)}
            >
              Save & add another
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}
