import { useMemo, useState } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Category, Subscription, Transaction } from '../db/types'
import { formatCurrency } from '../lib/currency'
import { formatMonth, isInMonth, shiftMonth } from '../lib/date'
import { MonthSelector } from './MonthSelector'

interface ReportsScreenProps {
  transactions: Transaction[]
  categories: Category[]
  subscriptions: Subscription[]
  currency: string
}

const colors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#ca8a04', '#059669', '#0891b2', '#64748b']

function monthExpense(transactions: Transaction[], month: string) {
  return transactions.filter((item) => item.type === 'expense' && isInMonth(item.date, month)).reduce((sum, item) => sum + item.amount, 0)
}

export function ReportsScreen({ transactions, categories, subscriptions, currency }: ReportsScreenProps) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>()
  const monthTransactions = useMemo(() => transactions.filter((item) => isInMonth(item.date, month)), [transactions, month])
  const categorySpending = useMemo(() => {
    const totals = new Map<number, number>()
    monthTransactions.filter((item) => item.type === 'expense' && item.categoryId).forEach((item) => totals.set(item.categoryId!, (totals.get(item.categoryId!) ?? 0) + item.amount))
    return [...totals.entries()].map(([categoryId, amount], index) => {
      const category = categories.find((item) => item.id === categoryId)
      return { categoryId, name: category?.name ?? 'Uncategorized', icon: category?.icon ?? '•', amount, color: category?.color || colors[index % colors.length] }
    }).sort((a, b) => b.amount - a.amount)
  }, [categories, monthTransactions])
  const lastSixMonths = useMemo(() => Array.from({ length: 6 }, (_, index) => shiftMonth(month, index - 5)).map((monthKey) => ({
    month: new Intl.DateTimeFormat('en-MY', { month: 'short' }).format(new Date(`${monthKey}-01T00:00:00`)),
    income: transactions.filter((item) => item.type === 'income' && isInMonth(item.date, monthKey)).reduce((sum, item) => sum + item.amount, 0),
    expenses: monthExpense(transactions, monthKey),
  })), [month, transactions])
  const totalExpenses = categorySpending.reduce((sum, item) => sum + item.amount, 0)
  const subscriptionTotal = monthTransactions.filter((item) => item.type === 'expense' && item.subscriptionId).reduce((sum, item) => sum + item.amount, 0)
  const previousMonth = shiftMonth(month, -1)
  const foodCategory = categories.find((item) => item.name === 'Food')
  const foodNow = foodCategory?.id ? categorySpending.find((item) => item.categoryId === foodCategory.id)?.amount ?? 0 : 0
  const foodBefore = foodCategory?.id ? transactions.filter((item) => item.type === 'expense' && item.categoryId === foodCategory.id && isInMonth(item.date, previousMonth)).reduce((sum, item) => sum + item.amount, 0) : 0
  const foodInsight = foodBefore > 0 && foodNow !== foodBefore ? `Food spending is ${Math.round(Math.abs((foodNow - foodBefore) / foodBefore) * 100)}% ${foodNow > foodBefore ? 'up' : 'down'} vs last month.` : undefined
  const selectedTransactions = selectedCategoryId ? monthTransactions.filter((item) => item.categoryId === selectedCategoryId) : []

  return <main className="px-5 pb-8 sm:px-7"><MonthSelector month={month} onChange={(value) => { setMonth(value); setSelectedCategoryId(undefined) }} />
    {monthTransactions.length === 0 ? <section className="mt-5 rounded-[1.75rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/80"><p className="text-3xl">◔</p><h2 className="mt-3 text-xl font-bold">No report data yet</h2><p className="mt-2 text-sm text-slate-500">Add transactions for {formatMonth(month)} to see your spending patterns.</p></section> : <div className="space-y-5 py-5">
      <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80"><div className="flex items-baseline justify-between"><div><p className="text-sm font-semibold text-blue-600">SPENDING</p><h2 className="mt-1 text-xl font-bold">By category</h2></div><strong className="text-lg">{formatCurrency(totalExpenses, currency)}</strong></div>
        {categorySpending.length ? <><div className="h-60"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categorySpending} dataKey="amount" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>{categorySpending.map((item) => <Cell key={item.categoryId} fill={item.color} />)}</Pie><Tooltip formatter={(value) => formatCurrency(Number(value), currency)} /></PieChart></ResponsiveContainer></div><div className="space-y-2">{categorySpending.map((item) => <button key={item.categoryId} type="button" onClick={() => setSelectedCategoryId(item.categoryId)} className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left ${selectedCategoryId === item.categoryId ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-slate-50'}`}><span className="font-semibold">{item.icon} {item.name}</span><span className="font-bold">{formatCurrency(item.amount, currency)}</span></button>)}</div></> : <p className="mt-4 text-sm text-slate-500">No expense categories used this month.</p>}
      </section>
      {selectedCategoryId && <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Category transactions</h2><button className="min-h-11 px-2 text-sm font-bold text-blue-700" onClick={() => setSelectedCategoryId(undefined)}>Clear</button></div><div className="mt-2 divide-y divide-slate-100">{selectedTransactions.map((item) => <div key={item.id} className="flex justify-between py-3 text-sm"><span>{item.note || 'Expense'}<small className="ml-2 text-slate-400">{item.date}</small></span><strong className="text-rose-600">{formatCurrency(item.amount, currency)}</strong></div>)}</div></section>}
      <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80"><p className="text-sm font-semibold text-blue-600">CASH FLOW</p><h2 className="mt-1 text-xl font-bold">Last 6 months</h2><div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={lastSixMonths} barGap={4}><XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12}/><YAxis hide/><Tooltip formatter={(value) => formatCurrency(Number(value), currency)} /><Bar dataKey="income" name="Income" fill="#16a34a" radius={[6,6,0,0]} /><Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></div></section>
      <section className="rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-sm"><p className="text-sm font-semibold text-blue-300">INSIGHTS</p><h2 className="mt-1 text-xl font-bold">Your month at a glance</h2><div className="mt-4 space-y-3 text-sm text-slate-200">{categorySpending[0] && <p><strong className="text-white">{categorySpending[0].icon} {categorySpending[0].name}</strong> is your biggest expense category at {formatCurrency(categorySpending[0].amount, currency)}.</p>}{foodInsight && <p>{foodInsight}</p>}<p>Subscriptions account for <strong className="text-white">{totalExpenses ? Math.round((subscriptionTotal / totalExpenses) * 100) : 0}%</strong> of this month’s expenses ({formatCurrency(subscriptionTotal, currency)}).</p>{subscriptions.filter((item) => item.status === 'active').length === 0 && <p>Add subscriptions in Settings to track renewal costs automatically.</p>}</div></section>
    </div>}
  </main>
}
