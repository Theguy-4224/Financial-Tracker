import { useState } from 'react'
import { hashPin, isValidPin } from '../lib/pin'
import { Logo } from './Logo'

export function LockScreen({ pinHash, onUnlock }: { pinHash: string; onUnlock: () => void }) {
  const [pin, setPin] = useState(''); const [error, setError] = useState('')
  async function unlock() { if (!isValidPin(pin) || await hashPin(pin) !== pinHash) { setError('That PIN is not correct.'); return }; onUnlock() }
  return <main className="grid min-h-dvh place-items-center bg-slate-950 px-5 text-center text-white"><section className="w-full max-w-sm rounded-[2rem] bg-slate-900 p-7 shadow-2xl ring-1 ring-white/10"><Logo size={64} className="mx-auto" /><h1 className="mt-5 text-2xl font-bold">Pocket Ledger is locked</h1><p className="mt-2 text-sm text-slate-300">Enter your PIN to view your money.</p><label className="mt-6 block text-left text-sm font-bold">PIN<input aria-label="PIN" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 8))} onKeyDown={(event) => event.key === 'Enter' && void unlock()} inputMode="numeric" type="password" className="mt-2 min-h-14 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 text-center text-2xl tracking-[0.5em]" /></label>{error && <p className="mt-2 text-sm text-rose-300">{error}</p>}<button onClick={() => void unlock()} className="mt-5 min-h-14 w-full rounded-2xl bg-blue-600 font-bold">Unlock</button></section></main>
}
