import type { Category } from '../db/types'

interface CategoryPreviewProps {
  categories: Category[]
}

export function CategoryPreview({ categories }: CategoryPreviewProps) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-600">Stage 1</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Default categories</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
          {categories.length} ready
        </span>
      </div>

      {categories.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {categories.map((category) => (
            <div
              key={category.id ?? category.name}
              className="flex min-h-24 flex-col items-center justify-center rounded-2xl bg-slate-50 p-3 text-center ring-1 ring-slate-100"
            >
              <span
                className="grid size-10 place-items-center rounded-xl text-xl"
                style={{ backgroundColor: `${category.color}18` }}
                aria-hidden="true"
              >
                {category.icon}
              </span>
              <span className="mt-2 text-sm font-semibold text-slate-700">{category.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
          Categories will appear after the local database is ready.
        </p>
      )}
    </section>
  )
}
