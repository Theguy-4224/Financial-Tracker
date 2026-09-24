export type AppTab = 'home' | 'transactions' | 'reports' | 'settings'

const leftTabs: { id: AppTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'transactions', label: 'Transactions', icon: '↕' },
]

const rightTabs: { id: AppTab; label: string; icon: string }[] = [
  { id: 'reports', label: 'Reports', icon: '◔' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

interface NavigationButtonProps {
  id: AppTab
  label: string
  icon: string
  activeTab: AppTab
  onSelect: (tab: AppTab) => void
}

function NavigationButton({ id, label, icon, activeTab, onSelect }: NavigationButtonProps) {
  const active = id === activeTab
  return (
    <button
      type="button"
      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold ${
        active ? 'text-blue-600' : 'text-slate-400'
      }`}
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect(id)}
    >
      <span className="text-xl leading-none" aria-hidden="true">
        {icon}
      </span>
      {label}
    </button>
  )
}

interface BottomNavigationProps {
  activeTab: AppTab
  onSelect: (tab: AppTab) => void
  onAdd: () => void
}

export function BottomNavigation({ activeTab, onSelect, onAdd }: BottomNavigationProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-2xl border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur"
      aria-label="Primary navigation"
    >
      <div className="relative grid grid-cols-5">
        {leftTabs.map((tab) => (
          <NavigationButton key={tab.id} {...tab} activeTab={activeTab} onSelect={onSelect} />
        ))}
        <div aria-hidden="true" />
        {rightTabs.map((tab) => (
          <NavigationButton key={tab.id} {...tab} activeTab={activeTab} onSelect={onSelect} />
        ))}
      </div>
      <button
        type="button"
        className="absolute -top-7 left-1/2 grid size-14 -translate-x-1/2 place-items-center rounded-2xl bg-blue-600 text-3xl font-light text-white shadow-xl shadow-blue-600/30 ring-4 ring-slate-50 active:scale-95"
        aria-label="Add transaction"
        onClick={onAdd}
      >
        +
      </button>
    </nav>
  )
}
