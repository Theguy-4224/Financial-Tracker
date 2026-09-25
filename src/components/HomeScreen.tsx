import { useMemo, useState } from 'react'
import type { Transaction } from '../db/types'
import type { FinanceData } from '../hooks/useFinanceData'
import { formatCurrency } from '../lib/currency'
import { currentMonthKey, formatMonth, isInMonth, todayInputValue } from '../lib/date'
import { getAccountBalance, getTotals } from '../lib/finance'
import { BalanceCard } from './BalanceCard'
import { BudgetProgress, getBudgetProgress } from './BudgetProgress'
import { MonthSelector } from './MonthSelector'
import { MonthlySummary } from './MonthlySummary'
import { TransactionList } from './TransactionList'
import { FinanceWidgets } from './FinanceWidgets'
import type { SettingsSection } from './SettingsScreen'

interface HomeScreenProps {
  data: FinanceData
  onOpenSettings: () => void
  onOpenBudgets: (month: string) => void
  onViewTransactions: () => void
  onEditTransaction: (transaction: Transaction) => void
  onDeleteTransaction: (transaction: Transaction) => void
  onOpenStageFive: (section: Extract<SettingsSection, 'goals' | 'bills' | 'subscriptions'>) => void
}

export function HomeScreen({
  data,
  onOpenSettings,
  onOpenBudgets,
  onViewTransactions,
  onEditTransaction,
  onDeleteTransaction,
  onOpenStageFive,
}: HomeScreenProps) {
  const [month, setMonth] = useState(currentMonthKey())
  const allTimeTotals = getTotals(data.accounts, data.transactions)
  const monthlyTransactions = useMemo(
    () => data.transactions.filter((transaction) => isInMonth(transaction.date, month)),
    [data.transactions, month],
  )
  const monthlyIncome = monthlyTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const monthlyExpenses = monthlyTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const recentTransactions = monthlyTransactions.slice(0, 5)
  const topBudgets = useMemo(
    () =>
      getBudgetProgress(data.budgets, data.categories, data.transactions, month)
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3),
    [data.budgets, data.categories, data.transactions, month],
  )
  const today = new Date(`${todayInputValue()}T00:00:00`)
  const soon = today.getTime() + 7 * 86400000
  const upcomingBills = data.bills.filter((bill) => !bill.paid && new Date(`${bill.dueDate}T00:00:00`).getTime() <= soon).slice(0, 3)
  const upcomingSubscriptions = data.subscriptions.filter((subscription) => subscription.status === 'active' && new Date(`${subscription.nextBillingDate}T00:00:00`).getTime() <= soon).slice(0, 3)

  return (
    <main>
      <MonthSelector month={month} onChange={setMonth} />
      <BalanceCard {...allTimeTotals} currency={data.settings.currency} />
      <div className="space-y-5 px-5 py-6 sm:px-7">
        <MonthlySummary
          income={monthlyIncome}
          expenses={monthlyExpenses}
          currency={data.settings.currency}
        />

        <FinanceWidgets
          income={monthlyIncome}
          expenses={monthlyExpenses}
          subscriptions={data.subscriptions}
          today={today}
          currency={data.settings.currency}
          onManageSubscriptions={() => onOpenStageFive('subscriptions')}
        />

        <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600">Your wallets</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Accounts</h2>
            </div>
            <button
              type="button"
              className="min-h-11 rounded-xl px-3 text-sm font-bold text-blue-700"
              onClick={onOpenSettings}
            >
              Manage
            </button>
          </div>
          {data.accounts.length > 0 ? (
            <div className="mt-4 space-y-3">
              {data.accounts.map((account) => (
                <div key={account.id} className="flex min-h-14 items-center gap-3 rounded-2xl bg-slate-50 px-4">
                  <span className="size-3 rounded-full" style={{ backgroundColor: account.color }} />
                  <span className="min-w-0 flex-1 truncate font-semibold text-slate-700">{account.name}</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(getAccountBalance(account, data.transactions), data.settings.currency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <button
              type="button"
              className="mt-4 min-h-24 w-full rounded-2xl border-2 border-dashed border-slate-200 px-4 text-sm font-semibold text-slate-500"
              onClick={onOpenSettings}
            >
              Add an account before recording your first transaction.
            </button>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4 px-1">
            <div>
              <p className="text-sm font-semibold text-blue-600">{formatMonth(month)}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Recent transactions</h2>
            </div>
            <button
              type="button"
              className="min-h-11 rounded-xl px-3 text-sm font-bold text-blue-700"
              onClick={onViewTransactions}
            >
              View all
            </button>
          </div>
          <TransactionList
            transactions={recentTransactions}
            accounts={data.accounts}
            categories={data.categories}
            currency={data.settings.currency}
            onEdit={onEditTransaction}
            onDelete={onDeleteTransaction}
            emptyTitle="No activity this month"
            emptyMessage="Tap + to add a transaction for this month."
          />
        </section>

        <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600">{formatMonth(month)}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Budget overview</h2>
            </div>
            <button type="button" className="min-h-11 rounded-xl px-3 text-sm font-bold text-blue-700" onClick={() => onOpenBudgets(month)}>
              Manage
            </button>
          </div>
          {topBudgets.length > 0 ? (
            <div className="mt-4 space-y-3">
              {topBudgets.map((item) => (
                <BudgetProgress key={item.budget.id} item={item} currency={data.settings.currency} onClick={() => onOpenBudgets(month)} />
              ))}
            </div>
          ) : (
            <button
              type="button"
              className="mt-4 min-h-24 w-full rounded-2xl border-2 border-dashed border-slate-200 px-4 text-sm font-semibold text-slate-500"
              onClick={() => onOpenBudgets(month)}
            >
              No budgets for this month. Add one to start tracking limits.
            </button>
          )}
        </section>

        <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Upcoming bills</h2><button className="min-h-11 px-3 text-sm font-bold text-blue-700" onClick={() => onOpenStageFive('bills')}>Manage</button></div>
          {upcomingBills.length ? <div className="mt-3 space-y-2">{upcomingBills.map(bill=>{const days=Math.ceil((new Date(`${bill.dueDate}T00:00:00`).getTime()-today.getTime())/86400000);const dueLabel=days<0?'Overdue':days===0?'Due today':`Due in ${days} days`;return <div key={bill.id} className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span><strong>{bill.name}</strong><span className={`ml-2 font-semibold ${days<0?'text-rose-600':'text-slate-500'}`}>{dueLabel}</span></span><span className="font-bold text-rose-600">{formatCurrency(bill.amount,data.settings.currency)}</span></div>})}</div> : <p className="mt-2 text-sm text-slate-500">No bills due in the next 7 days.</p>}
        </section>

        <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Upcoming renewals</h2><button className="min-h-11 px-3 text-sm font-bold text-blue-700" onClick={() => onOpenStageFive('subscriptions')}>Manage</button></div>
          {upcomingSubscriptions.length ? <div className="mt-3 space-y-2">{upcomingSubscriptions.map(subscription=><div key={subscription.id} className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"><span className="font-bold">{subscription.icon} {subscription.name} · {subscription.nextBillingDate}</span><span className="font-bold text-rose-600">{formatCurrency(subscription.amount,data.settings.currency)}</span></div>)}</div> : <p className="mt-2 text-sm text-slate-500">No renewals due in the next 7 days.</p>}
        </section>

        <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Savings goals</h2><button className="min-h-11 px-3 text-sm font-bold text-blue-700" onClick={() => onOpenStageFive('goals')}>Manage</button></div>
          {data.goals.length ? <div className="mt-3 space-y-3">{data.goals.slice(0,2).map(goal=>{const pct=Math.min(100,goal.savedAmount/goal.targetAmount*100);return <div key={goal.id}><div className="flex justify-between text-sm font-bold"><span>{goal.name}</span><span>{Math.round(pct)}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-600" style={{width:`${pct}%`}} /></div></div>})}</div> : <p className="mt-2 text-sm text-slate-500">No savings goals yet.</p>}
        </section>
      </div>
    </main>
  )
}
