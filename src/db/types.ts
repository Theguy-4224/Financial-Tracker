export type AccountType = 'cash' | 'bank' | 'e-wallet' | 'credit-card'
export type CategoryType = 'income' | 'expense'
export type TransactionType = CategoryType | 'transfer'
export type Frequency = 'weekly' | 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled'
export type ThemePreference = 'light' | 'dark' | 'system'

export interface Account {
  id?: number
  name: string
  type: AccountType
  startingBalance: number
  color: string
}

export interface Category {
  id?: number
  name: string
  icon: string
  color: string
  type: CategoryType
  isDefault: boolean
}

export interface Transaction {
  id?: number
  type: TransactionType
  amount: number
  categoryId?: number
  accountId: number
  toAccountId?: number
  date: string
  note: string
  recurringId?: number
  subscriptionId?: number
}

export interface Budget {
  id?: number
  categoryId: number
  month: string
  limit: number
}

export interface Recurring {
  id?: number
  type: CategoryType
  amount: number
  categoryId: number
  accountId: number
  note: string
  frequency: Frequency
  nextDate: string
  active: boolean
  anchorDay?: number
}

export interface Subscription {
  id?: number
  name: string
  amount: number
  cycle: Frequency
  nextBillingDate: string
  categoryId: number
  accountId: number
  status: SubscriptionStatus
  note: string
  color: string
  icon?: string
  anchorDay?: number
}

export interface Goal {
  id?: number
  name: string
  targetAmount: number
  savedAmount: number
  targetDate?: string
}

export interface Bill {
  id?: number
  name: string
  amount: number
  dueDate: string
  repeat: Frequency | 'none'
  paid: boolean
  accountId?: number
  categoryId?: number
  note?: string
}

export interface Settings {
  id: number
  currency: string
  theme: ThemePreference
  pinHash?: string
}
