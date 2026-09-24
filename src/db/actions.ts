import { db } from './database'
import { advanceRecurringDate } from '../lib/recurrence'
import { todayInputValue } from '../lib/date'
import type { Account, Bill, Budget, Category, Goal, Recurring, Settings, Subscription, Transaction } from './types'

export const DATA_CHANGED_EVENT = 'pocket-ledger:data-changed'

export function notifyDataChanged() {
  window.dispatchEvent(new Event(DATA_CHANGED_EVENT))
}

export async function saveSettings(settings: Settings) { await db.settings.put(settings); notifyDataChanged() }

export async function importTransactions(transactions: Omit<Transaction, 'id' | 'toAccountId'>[]) {
  await db.transaction('rw', db.transactions, async () => { await db.transactions.bulkAdd(transactions) })
  notifyDataChanged()
}

export async function saveAccount(account: Account) {
  const record = {
    ...account,
    name: account.name.trim(),
    startingBalance: Number(account.startingBalance),
  }

  if (!record.name) throw new Error('Enter an account name.')
  if (!Number.isFinite(record.startingBalance)) throw new Error('Enter a valid starting balance.')

  if (record.id) {
    await db.accounts.put(record)
  } else {
    await db.accounts.add(record)
  }

  notifyDataChanged()
}

export async function deleteAccount(id: number) {
  const [outgoing, incoming, recurringCount, subscriptionCount, billCount] = await Promise.all([
    db.transactions.where('accountId').equals(id).count(),
    db.transactions.where('toAccountId').equals(id).count(),
    db.recurring.where('accountId').equals(id).count(),
    db.subscriptions.where('accountId').equals(id).count(),
    db.bills.filter((bill) => bill.accountId === id).count(),
  ])

  if (outgoing + incoming + recurringCount + subscriptionCount + billCount > 0) {
    throw new Error('This account is in use and cannot be deleted. Rename it instead.')
  }

  await db.accounts.delete(id)
  notifyDataChanged()
}

export async function saveCategory(category: Category) {
  const record = { ...category, name: category.name.trim(), icon: category.icon.trim() || '✨' }

  if (!record.name) throw new Error('Enter a category name.')

  if (record.id) {
    const existing = await db.categories.get(record.id)
    const transactionCount = await db.transactions.where('categoryId').equals(record.id).count()
    if (existing && existing.type !== record.type && transactionCount > 0) {
      throw new Error('A category with transactions cannot change between income and expense.')
    }
    await db.categories.put(record)
  } else {
    await db.categories.add(record)
  }

  notifyDataChanged()
}

export async function deleteCategory(id: number) {
  const [transactionCount, budgetCount, recurringCount, subscriptionCount, billCount] = await Promise.all([
    db.transactions.where('categoryId').equals(id).count(),
    db.budgets.where('categoryId').equals(id).count(),
    db.recurring.where('categoryId').equals(id).count(),
    db.subscriptions.where('categoryId').equals(id).count(),
    db.bills.filter((bill) => bill.categoryId === id).count(),
  ])

  if (transactionCount + budgetCount + recurringCount + subscriptionCount + billCount > 0) {
    throw new Error('This category is in use and cannot be deleted. Rename it instead.')
  }

  await db.categories.delete(id)
  notifyDataChanged()
}

export async function saveTransaction(transaction: Transaction) {
  const amount = Number(transaction.amount)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter an amount greater than zero.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(transaction.date)) throw new Error('Choose a valid date.')

  const account = await db.accounts.get(transaction.accountId)
  if (!account) throw new Error('Choose a valid account.')

  if (transaction.type === 'transfer') {
    if (!transaction.toAccountId) throw new Error('Choose the receiving account.')
    if (transaction.toAccountId === transaction.accountId) {
      throw new Error('Transfer accounts must be different.')
    }
    const receivingAccount = await db.accounts.get(transaction.toAccountId)
    if (!receivingAccount) throw new Error('Choose a valid receiving account.')
  } else {
    if (!transaction.categoryId) throw new Error('Choose a category.')
    const category = await db.categories.get(transaction.categoryId)
    if (!category || category.type !== transaction.type) throw new Error('Choose a matching category.')
  }

  const record: Transaction = {
    ...transaction,
    amount,
    note: transaction.note.trim().slice(0, 100),
    categoryId: transaction.type === 'transfer' ? undefined : transaction.categoryId,
    toAccountId: transaction.type === 'transfer' ? transaction.toAccountId : undefined,
  }

  if (record.id) {
    await db.transactions.put(record)
  } else {
    await db.transactions.add(record)
  }

  notifyDataChanged()
}

export async function deleteTransaction(id: number) {
  const transaction = await db.transactions.get(id)
  if (!transaction) throw new Error('Transaction no longer exists.')
  await db.transactions.delete(id)
  notifyDataChanged()
  return transaction
}

export async function restoreTransaction(transaction: Transaction) {
  await db.transactions.put(transaction)
  notifyDataChanged()
}

export async function saveBudget(budget: Budget) {
  const limit = Number(budget.limit)
  if (!budget.categoryId) throw new Error('Choose an expense category.')
  if (!/^\d{4}-\d{2}$/.test(budget.month)) throw new Error('Choose a valid month.')
  if (!Number.isFinite(limit) || limit <= 0) throw new Error('Enter a budget greater than zero.')

  const category = await db.categories.get(budget.categoryId)
  if (!category || category.type !== 'expense') throw new Error('Choose a valid expense category.')

  const existing = await db.budgets.where('[categoryId+month]').equals([budget.categoryId, budget.month]).first()
  await db.budgets.put({ ...budget, id: budget.id ?? existing?.id, limit })
  notifyDataChanged()
}

export async function deleteBudget(id: number) {
  await db.budgets.delete(id)
  notifyDataChanged()
}

export async function saveRecurring(recurring: Recurring) {
  const amount = Number(recurring.amount)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter an amount greater than zero.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(recurring.nextDate)) throw new Error('Choose a valid next date.')

  const [account, category] = await Promise.all([
    db.accounts.get(recurring.accountId),
    db.categories.get(recurring.categoryId),
  ])
  if (!account) throw new Error('Choose a valid account.')
  if (!category || category.type !== recurring.type) throw new Error('Choose a matching category.')

  const record: Recurring = {
    ...recurring,
    amount,
    note: recurring.note.trim().slice(0, 100),
    anchorDay: recurring.anchorDay ?? Number(recurring.nextDate.slice(8, 10)),
  }

  if (record.id) await db.recurring.put(record)
  else await db.recurring.add(record)
  notifyDataChanged()
}

export async function setRecurringActive(id: number, active: boolean) {
  await db.recurring.update(id, { active })
  notifyDataChanged()
}

export async function deleteRecurring(id: number) {
  await db.recurring.delete(id)
  notifyDataChanged()
}

export async function saveGoal(goal: Goal) {
  if (!goal.name.trim()) throw new Error('Enter a goal name.')
  if (!Number.isFinite(goal.targetAmount) || goal.targetAmount <= 0) throw new Error('Enter a target amount greater than zero.')
  const record = { ...goal, name: goal.name.trim(), savedAmount: Math.max(0, Number(goal.savedAmount)), targetAmount: Number(goal.targetAmount) }
  if (record.id) await db.goals.put(record); else await db.goals.add(record)
  notifyDataChanged()
}

export async function deleteGoal(id: number) { await db.goals.delete(id); notifyDataChanged() }

export async function addGoalContribution(id: number, amount: number) {
  const goal = await db.goals.get(id)
  if (!goal || !Number.isFinite(amount) || amount <= 0) throw new Error('Enter a contribution greater than zero.')
  await db.goals.update(id, { savedAmount: goal.savedAmount + amount })
  notifyDataChanged()
}

export async function saveBill(bill: Bill) {
  if (!bill.name.trim()) throw new Error('Enter a bill name.')
  if (!Number.isFinite(bill.amount) || bill.amount <= 0) throw new Error('Enter an amount greater than zero.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bill.dueDate)) throw new Error('Choose a valid due date.')
  const record = { ...bill, name: bill.name.trim(), amount: Number(bill.amount), note: bill.note?.trim().slice(0, 100) ?? '' }
  if (record.id) await db.bills.put(record); else await db.bills.add(record)
  notifyDataChanged()
}

export async function deleteBill(id: number) { await db.bills.delete(id); notifyDataChanged() }

export async function markBillPaid(id: number) {
  const bill = await db.bills.get(id)
  if (!bill) throw new Error('Bill not found.')
  if (bill.paid && bill.repeat === 'none') throw new Error('This bill is already marked paid.')
  const accountId = bill.accountId ?? (await db.accounts.orderBy('id').first())?.id
  const categoryId = bill.categoryId ?? (await db.categories.where('name').equals('Bills').first())?.id
  if (!accountId || !categoryId) throw new Error('Add an account and a Bills category before marking a bill paid.')
  await db.transaction('rw', db.bills, db.transactions, async () => {
    await db.transactions.add({ type: 'expense', amount: bill.amount, categoryId, accountId, date: todayInputValue(), note: bill.note || bill.name })
    if (bill.repeat === 'none') await db.bills.update(id, { paid: true })
    else await db.bills.update(id, { paid: false, dueDate: advanceRecurringDate(bill.dueDate, bill.repeat) })
  })
  notifyDataChanged()
}

export async function saveSubscription(subscription: Subscription) {
  if (!subscription.name.trim()) throw new Error('Enter a subscription name.')
  if (!Number.isFinite(subscription.amount) || subscription.amount <= 0) throw new Error('Enter an amount greater than zero.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(subscription.nextBillingDate)) throw new Error('Choose a valid billing date.')
  const category = await db.categories.get(subscription.categoryId)
  if (!category || category.type !== 'expense') throw new Error('Choose an expense category.')
  if (!await db.accounts.get(subscription.accountId)) throw new Error('Choose a valid account.')
  const record = { ...subscription, name: subscription.name.trim(), amount: Number(subscription.amount), note: subscription.note.trim().slice(0, 100), anchorDay: subscription.anchorDay ?? Number(subscription.nextBillingDate.slice(8,10)) }
  if (record.id) await db.subscriptions.put(record); else await db.subscriptions.add(record)
  notifyDataChanged()
}

export async function deleteSubscription(id: number) { await db.subscriptions.delete(id); notifyDataChanged() }
