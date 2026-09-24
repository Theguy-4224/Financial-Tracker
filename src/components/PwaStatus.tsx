import { useEffect, useState } from 'react'

interface InstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => { const update = () => setOnline(navigator.onLine); window.addEventListener('online', update); window.addEventListener('offline', update); return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) } }, [])
  return online ? null : <div role="status" className="sticky top-0 z-50 bg-amber-400 px-4 py-2 text-center text-sm font-bold text-amber-950">You’re offline. Saved data and installed screens still work.</div>
}

export function InstallAppCard() {
  const [prompt, setPrompt] = useState<InstallPromptEvent>()
  const [installed, setInstalled] = useState(window.matchMedia('(display-mode: standalone)').matches)
  useEffect(() => { const ready = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent) }; const done = () => { setInstalled(true); setPrompt(undefined) }; window.addEventListener('beforeinstallprompt', ready); window.addEventListener('appinstalled', done); return () => { window.removeEventListener('beforeinstallprompt', ready); window.removeEventListener('appinstalled', done) } }, [])
  async function install() { if (!prompt) return; await prompt.prompt(); const choice = await prompt.userChoice; if (choice.outcome === 'accepted') setPrompt(undefined) }
  return <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80"><p className="text-sm font-semibold text-blue-600">APP</p><h2 className="mt-1 text-xl font-bold">Install Pocket Ledger</h2><p className="mt-2 text-sm text-slate-500">Keep it on your home screen and open it like a regular app.</p>{installed ? <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">Installed on this device</p> : prompt ? <button className="mt-4 min-h-12 w-full rounded-xl bg-blue-600 font-bold text-white" onClick={() => void install()}>Install app</button> : <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">Use your browser’s “Add to Home Screen” or “Install app” option.</p>}</section>
}
