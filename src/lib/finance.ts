import type { Account, Transaction } from '../db/types'

export function getAccountBalance(account: Account, transactions: Transaction[]) {
  if (!account.id) return account.startingBalance

  return transactions.reduce((balance, transaction) => {
    if (transaction.type === 'income' && transaction.accountId === account.id) {
      return balance + transaction.amount
    }
    if (transaction.type === 'expense' && transaction.accountId === account.id) {
      return balance - transaction.amount
    }
    if (transaction.type === 'transfer') {
      if (transaction.accountId === account.id) return balance - transaction.amount
      if (transaction.toAccountId === account.id) return balance + transaction.amount
    }
    return balance
  }, account.startingBalance)
}

export function getTotals(accounts: Account[], transactions: Transaction[]) {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const balance = accounts.reduce(
    (sum, account) => sum + getAccountBalance(account, transactions),
    0,
  )

  return { income, expenses, balance }
}
