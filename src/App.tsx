import { useEffect, useRef, useState } from 'react'
import { deleteTransaction, restoreTransaction } from './db/actions'
import type { Transaction } from './db/types'
import { AppHeader } from './components/AppHeader'
import { BottomNavigation, type AppTab } from './components/BottomNavigation'
import { DatabaseStatus } from './components/DatabaseStatus'
import { HomeScreen } from './components/HomeScreen'
import { SettingsScreen, type SettingsSection } from './components/SettingsScreen'
import { TransactionSheet } from './components/TransactionSheet'
import { TransactionsScreen } from './components/TransactionsScreen'
import { ReportsScreen } from './components/ReportsScreen'
import { LockScreen } from './components/LockScreen'
import { OfflineBanner } from './components/PwaStatus'
import { UndoToast } from './components/UndoToast'
import { useFinanceData } from './hooks/useFinanceData'
import { useWebMcpTools } from './hooks/useWebMcpTools'
import { currentMonthKey } from './lib/date'

const screenTitles: Record<AppTab, { eyebrow: string; title: string }> = {
  home: { eyebrow: 'Your monthly overview', title: 'Pocket Ledger' },
  transactions: { eyebrow: 'Money in and out', title: 'Transactions' },
  reports: { eyebrow: 'Understand your spending', title: 'Reports' },
  settings: { eyebrow: 'Organize your money', title: 'Settings' },
}

export default function App() {
  const finance = useFinanceData()
  const [activeTab, setActiveTab] = useState<AppTab>('home')
  const [transactionSheetOpen, setTransactionSheetOpen] = useState(false)
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('accounts')
  const [budgetMonth, setBudgetMonth] = useState(currentMonthKey())
  const [editingTransaction, setEditingTransaction] = useState<Transaction>()
  const [deletedTransaction, setDeletedTransaction] = useState<Transaction>()
  const [unlocked, setUnlocked] = useState(false)
  const undoTimer = useRef<number | undefined>(undefined)

  useWebMcpTools()

  useEffect(() => {
    const theme = finance.data.settings.theme
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', dark)
  }, [finance.data.settings.theme])

  useEffect(
    () => () => {
      if (undoTimer.current) window.clearTimeout(undoTimer.current)
    },
    [],
  )

  function openNewTransaction() {
    setEditingTransaction(undefined)
    setTransactionSheetOpen(true)
  }

  function openEditTransaction(transaction: Transaction) {
    setEditingTransaction(transaction)
    setTransactionSheetOpen(true)
  }

  async function handleDeleteTransaction(transaction: Transaction) {
    if (!transaction.id) return
    try {
      const deleted = await deleteTransaction(transaction.id)
      setDeletedTransaction(deleted)
      if (undoTimer.current) window.clearTimeout(undoTimer.current)
      undoTimer.current = window.setTimeout(() => setDeletedTransaction(undefined), 6000)
    } catch {
      setDeletedTransaction(undefined)
    }
  }

  async function handleUndo() {
    if (!deletedTransaction) return
    await restoreTransaction(deletedTransaction)
    if (undoTimer.current) window.clearTimeout(undoTimer.current)
    setDeletedTransaction(undefined)
  }

  const title = screenTitles[activeTab]

  if (finance.status === 'ready' && finance.data.settings.pinHash && !unlocked) return <LockScreen pinHash={finance.data.settings.pinHash} onUnlock={() => setUnlocked(true)} />

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <OfflineBanner />
      <div className="mx-auto min-h-dvh max-w-2xl bg-slate-50 pb-28">
        <AppHeader eyebrow={title.eyebrow} title={title.title} />

        {finance.status !== 'ready' ? (
          <main className="px-5 py-5 sm:px-7">
            <DatabaseStatus status={finance.status} message={finance.message} />
          </main>
        ) : activeTab === 'home' ? (
          <HomeScreen
            data={finance.data}
            onOpenSettings={() => {
              setSettingsSection('accounts')
              setActiveTab('settings')
            }}
            onOpenBudgets={(month) => {
              setBudgetMonth(month)
              setSettingsSection('budgets')
              setActiveTab('settings')
            }}
            onViewTransactions={() => setActiveTab('transactions')}
            onEditTransaction={openEditTransaction}
            onDeleteTransaction={(transaction) => void handleDeleteTransaction(transaction)}
            onOpenStageFive={(section) => { setSettingsSection(section); setActiveTab('settings') }}
          />
        ) : activeTab === 'transactions' ? (
          <TransactionsScreen
            transactions={finance.data.transactions}
            accounts={finance.data.accounts}
            categories={finance.data.categories}
            currency={finance.data.settings.currency}
            onEdit={openEditTransaction}
            onDelete={(transaction) => void handleDeleteTransaction(transaction)}
          />
        ) : activeTab === 'settings' ? (
          <SettingsScreen
            data={finance.data}
            section={settingsSection}
            onSectionChange={setSettingsSection}
            budgetMonth={budgetMonth}
          />
        ) : (
          <ReportsScreen
            transactions={finance.data.transactions}
            categories={finance.data.categories}
            subscriptions={finance.data.subscriptions}
            currency={finance.data.settings.currency}
          />
        )}

        <BottomNavigation activeTab={activeTab} onSelect={setActiveTab} onAdd={openNewTransaction} />
      </div>

      <TransactionSheet
        open={transactionSheetOpen}
        accounts={finance.data.accounts}
        categories={finance.data.categories}
        transaction={editingTransaction}
        onClose={() => setTransactionSheetOpen(false)}
        onSaved={finance.refresh}
      />

      {deletedTransaction && (
        <UndoToast
          message="Transaction deleted"
          onUndo={() => void handleUndo()}
          onDismiss={() => setDeletedTransaction(undefined)}
        />
      )}
    </div>
  )
}
