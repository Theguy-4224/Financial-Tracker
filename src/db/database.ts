import Dexie, { type Table } from 'dexie'
import { DEFAULT_CATEGORIES } from './defaultCategories'
import type {
  Account,
  Bill,
  Budget,
  Category,
  Goal,
  Recurring,
  Settings,
  Subscription,
  Transaction,
} from './types'

export class FinanceDatabase extends Dexie {
  accounts!: Table<Account, number>
  categories!: Table<Category, number>
  transactions!: Table<Transaction, number>
  budgets!: Table<Budget, number>
  recurring!: Table<Recurring, number>
  subscriptions!: Table<Subscription, number>
  goals!: Table<Goal, number>
  bills!: Table<Bill, number>
  settings!: Table<Settings, number>

  constructor() {
    super('pocketLedger')

    this.version(1).stores({
      accounts: '++id, name, type',
      categories: '++id, name, type, isDefault',
      transactions:
        '++id, date, type, categoryId, accountId, toAccountId, recurringId, subscriptionId, [accountId+date], [categoryId+date]',
      budgets: '++id, &[categoryId+month], month, categoryId',
      recurring: '++id, nextDate, active, frequency',
      subscriptions: '++id, nextBillingDate, status, categoryId, accountId',
      goals: '++id, targetDate',
      bills: '++id, dueDate, paid',
      settings: 'id',
    })

    this.on('populate', async () => {
      await this.transaction('rw', this.categories, this.settings, async () => {
        await this.categories.bulkAdd(DEFAULT_CATEGORIES)
        await this.settings.add({ id: 1, currency: 'MYR', theme: 'system' })
      })
    })
  }
}

export const db = new FinanceDatabase()
