export function EmptyTransactions() {
  return (
    <section className="rounded-[1.75rem] bg-white px-5 py-8 text-center shadow-sm ring-1 ring-slate-200/80">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-2xl" aria-hidden="true">
        🧾
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-950">No transactions yet</h2>
      <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-slate-500">
        Transaction entry arrives in Stage 2. Your database and categories are ready for it.
      </p>
    </section>
  )
}
