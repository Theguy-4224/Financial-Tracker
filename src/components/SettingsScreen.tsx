import type { FinanceData } from '../hooks/useFinanceData'
import { AccountsManager } from './AccountsManager'
import { BudgetManager } from './BudgetManager'
import { CategoriesManager } from './CategoriesManager'
import { RecurringManager } from './RecurringManager'
import { BillsManager, GoalsManager, SubscriptionsManager } from './StageFiveManagers'
import { StageSevenManager } from './StageSevenManager'
import { InstallAppCard } from './PwaStatus'

export type SettingsSection = 'accounts' | 'categories' | 'budgets' | 'recurring' | 'goals' | 'bills' | 'subscriptions' | 'preferences'

interface SettingsScreenProps {
  data: FinanceData
  section: SettingsSection
  onSectionChange: (section: SettingsSection) => void
  budgetMonth: string
}

export function SettingsScreen({ data, section, onSectionChange, budgetMonth }: SettingsScreenProps) {
  const sections: SettingsSection[] = ['accounts', 'categories', 'budgets', 'recurring', 'goals', 'bills', 'subscriptions', 'preferences']

  return (
    <main className="px-5 pb-6 sm:px-7">
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/70 p-1 sm:grid-cols-4">
        {sections.map((option) => (
          <button
            key={option}
            type="button"
            className={`min-h-11 rounded-xl text-sm font-bold capitalize ${
              section === option ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
            }`}
            onClick={() => onSectionChange(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {section === 'accounts' ? (
        <AccountsManager accounts={data.accounts} transactions={data.transactions} currency={data.settings.currency} />
      ) : section === 'categories' ? (
        <CategoriesManager categories={data.categories} />
      ) : section === 'budgets' ? (
        <BudgetManager
          budgets={data.budgets}
          categories={data.categories}
          transactions={data.transactions}
          currency={data.settings.currency}
          initialMonth={budgetMonth}
        />
      ) : (
        section === 'recurring' ? (
        <RecurringManager
          recurring={data.recurring}
          accounts={data.accounts}
          categories={data.categories}
          currency={data.settings.currency}
        />
        ) : section === 'goals' ? (
          <GoalsManager goals={data.goals} currency={data.settings.currency} />
        ) : section === 'bills' ? (
          <BillsManager bills={data.bills} accounts={data.accounts} categories={data.categories} currency={data.settings.currency} />
        ) : section === 'subscriptions' ? (
          <SubscriptionsManager subscriptions={data.subscriptions} accounts={data.accounts} categories={data.categories} currency={data.settings.currency} />
        ) : (
          <div className="space-y-5"><InstallAppCard /><StageSevenManager data={data} /></div>
        )
      )}
    </main>
  )
}
