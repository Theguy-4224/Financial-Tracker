import { useCallback, useEffect, useState } from 'react'
import { DATA_CHANGED_EVENT } from '../db/actions'
import { db } from '../db/database'
import { processDueRecurringTransactions, processDueSubscriptions } from '../db/recurringEngine'
import type { Account, Bill, Budget, Category, Goal, Recurring, Settings, Subscription, Transaction } from '../db/types'

export interface FinanceData {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
  recurring: Recurring[]
  goals: Goal[]
  bills: Bill[]
  subscriptions: Subscription[]
  settings: Settings
}

interface FinanceState {
  status: 'loading' | 'ready' | 'error'
  message: string
  data: FinanceData
}

const emptyData: FinanceData = {
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  recurring: [],
  goals: [],
  bills: [],
  subscriptions: [],
  settings: { id: 1, currency: 'MYR', theme: 'system' },
}

export function useFinanceData() {
  const [state, setState] = useState<FinanceState>({
    status: 'loading',
    message: 'Opening your private local database…',
    data: emptyData,
  })

  const refresh = useCallback(async () => {
    try {
      await db.open()
      await processDueRecurringTransactions()
      await processDueSubscriptions()
      const [accounts, categories, transactions, budgets, recurring, goals, bills, subscriptions, settings] = await Promise.all([
        db.accounts.orderBy('id').toArray(),
        db.categories.orderBy('id').toArray(),
        db.transactions.orderBy('date').reverse().toArray(),
        db.budgets.orderBy('month').reverse().toArray(),
        db.recurring.orderBy('nextDate').toArray(),
        db.goals.toArray(),
        db.bills.orderBy('dueDate').toArray(),
        db.subscriptions.orderBy('nextBillingDate').toArray(),
        db.settings.get(1),
      ])

      setState({
        status: 'ready',
        message: 'Local database ready',
        data: {
          accounts,
          categories,
          transactions,
          budgets,
          recurring,
          goals,
          bills,
          subscriptions,
          settings: settings ?? emptyData.settings,
        },
      })
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Could not open the local database.',
        data: emptyData,
      })
    }
  }, [])

  useEffect(() => {
    void refresh()
    window.addEventListener(DATA_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(DATA_CHANGED_EVENT, refresh)
  }, [refresh])

  return { ...state, refresh }
}
