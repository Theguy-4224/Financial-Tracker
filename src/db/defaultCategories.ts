import type { Category } from './types'

export const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Food', icon: '🍜', color: '#f97316', type: 'expense', isDefault: true },
  { name: 'Transport', icon: '🚗', color: '#0ea5e9', type: 'expense', isDefault: true },
  { name: 'Bills', icon: '🧾', color: '#8b5cf6', type: 'expense', isDefault: true },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense', isDefault: true },
  { name: 'Health', icon: '💊', color: '#14b8a6', type: 'expense', isDefault: true },
  { name: 'Entertainment', icon: '🎬', color: '#6366f1', type: 'expense', isDefault: true },
  { name: 'Subscriptions', icon: '🔁', color: '#a855f7', type: 'expense', isDefault: true },
  { name: 'Salary', icon: '💼', color: '#16a34a', type: 'income', isDefault: true },
  { name: 'Other', icon: '✨', color: '#64748b', type: 'expense', isDefault: true },
]
