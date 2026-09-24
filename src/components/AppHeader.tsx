interface AppHeaderProps {
  eyebrow: string
  title: string
}

export function AppHeader({ eyebrow, title }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-5 pb-4 pt-6 sm:px-7">
      <div>
        <p className="text-sm font-medium text-slate-500">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
      </div>
      <Logo className="shrink-0 shadow-lg shadow-blue-600/20" />
    </header>
  )
}
import { Logo } from './Logo'
