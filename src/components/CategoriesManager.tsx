import { useState, type FormEvent } from 'react'
import { deleteCategory, saveCategory } from '../db/actions'
import type { Category, CategoryType } from '../db/types'
import { BottomSheet } from './BottomSheet'

interface CategoriesManagerProps {
  categories: Category[]
}

const emptyCategory: Category = {
  name: '',
  icon: '✨',
  color: '#2563eb',
  type: 'expense',
  isDefault: false,
}

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const [editing, setEditing] = useState<Category>()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [error, setError] = useState('')

  function openCategory(category?: Category) {
    setEditing(category ? { ...category } : { ...emptyCategory })
    setError('')
    setSheetOpen(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    try {
      await saveCategory(editing)
      setSheetOpen(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the category.')
    }
  }

  async function handleDelete(category: Category) {
    if (!category.id) return
    setError('')
    try {
      await deleteCategory(category.id)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete the category.')
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Categories</h2>
          <p className="mt-1 text-sm text-slate-500">Customize names, icons, colors, and types.</p>
        </div>
        <button
          type="button"
          className="min-h-11 rounded-2xl bg-blue-600 px-4 font-bold text-white"
          onClick={() => openCategory()}
        >
          Add category
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map((category) => (
          <article
            key={category.id}
            className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200/80"
          >
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                className="grid size-11 place-items-center rounded-2xl text-xl"
                style={{ backgroundColor: `${category.color}18` }}
                aria-label={`Edit ${category.name}`}
                onClick={() => openCategory(category)}
              >
                {category.icon}
              </button>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label={`Delete ${category.name}`}
                onClick={() => void handleDelete(category)}
              >
                ×
              </button>
            </div>
            <button type="button" className="mt-2 min-h-11 w-full text-left" onClick={() => openCategory(category)}>
              <span className="block truncate font-bold text-slate-800">{category.name}</span>
              <span className={`mt-1 block text-sm font-semibold capitalize ${category.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {category.type}
              </span>
            </button>
          </article>
        ))}
      </div>

      <BottomSheet
        open={sheetOpen}
        title={editing?.id ? 'Edit category' : 'Add category'}
        onClose={() => setSheetOpen(false)}
      >
        {editing && (
          <form className="space-y-4 py-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="grid grid-cols-[5rem_1fr] gap-3">
              <label className="block text-sm font-bold text-slate-700">
                Icon
                <input
                  required
                  maxLength={4}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-3 text-center text-xl"
                  value={editing.icon}
                  onChange={(event) => setEditing({ ...editing, icon: event.target.value })}
                />
              </label>
              <label className="block text-sm font-bold text-slate-700">
                Name
                <input
                  autoFocus
                  required
                  maxLength={30}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 px-4 text-base"
                  value={editing.name}
                  onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                />
              </label>
            </div>
            <label className="block text-sm font-bold text-slate-700">
              Type
              <select
                className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base"
                value={editing.type}
                onChange={(event) => setEditing({ ...editing, type: event.target.value as CategoryType })}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <label className="flex min-h-12 items-center justify-between rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700">
              Category color
              <input
                type="color"
                className="size-9 rounded-lg border-0 bg-transparent"
                value={editing.color}
                onChange={(event) => setEditing({ ...editing, color: event.target.value })}
              />
            </label>
            {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
            <button type="submit" className="min-h-12 w-full rounded-2xl bg-blue-600 px-4 font-bold text-white">
              Save category
            </button>
          </form>
        )}
      </BottomSheet>
    </section>
  )
}
