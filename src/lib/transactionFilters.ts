import type { TransactionType } from '../db/types'

export interface TransactionFilterState {
  query: string
  type: TransactionType | 'all'
  categoryId: number | 'all'
  accountId: number | 'all'
  startDate: string
  endDate: string
}

export const EMPTY_TRANSACTION_FILTERS: TransactionFilterState = {
  query: '',
  type: 'all',
  categoryId: 'all',
  accountId: 'all',
  startDate: '',
  endDate: '',
}

export function activeFilterCount(filters: TransactionFilterState) {
  return [
    filters.type !== 'all',
    filters.categoryId !== 'all',
    filters.accountId !== 'all',
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length
}
