import { useEffect } from 'react'
import { saveBill, saveBudget, saveGoal, saveRecurring, saveSubscription, saveTransaction } from '../db/actions'
import { db } from '../db/database'
import type { TransactionType } from '../db/types'
import { todayInputValue } from '../lib/date'

interface WebMcpTool {
  name: string
  title: string
  description: string
  inputSchema: object
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }
  execute: (input: unknown) => unknown | Promise<unknown>
}

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void | Promise<void>
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function useWebMcpTools() {
  useEffect(() => {
    const context = document.modelContext
    if (!context?.registerTool) return
    const lifecycle = new AbortController()

    const register = async () => {
      await context.registerTool(
        {
          name: 'create_transaction',
          title: 'Create transaction',
          description: 'Create an income, expense, or transfer in Pocket Ledger and update the visible app.',
          inputSchema: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['income', 'expense', 'transfer'] },
              amount: { type: 'number', exclusiveMinimum: 0 },
              accountId: { type: 'number' },
              categoryId: { type: 'number' },
              toAccountId: { type: 'number' },
              date: { type: 'string', description: 'Date in YYYY-MM-DD format.' },
              note: { type: 'string' },
            },
            required: ['type', 'amount', 'accountId'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input) {
            if (!isRecord(input)) throw new Error('Transaction input must be an object.')
            const type = input.type as TransactionType
            if (!['income', 'expense', 'transfer'].includes(type)) throw new Error('Invalid transaction type.')
            if (typeof input.amount !== 'number' || typeof input.accountId !== 'number') {
              throw new Error('Amount and accountId are required numbers.')
            }
            await saveTransaction({
              type,
              amount: input.amount,
              accountId: input.accountId,
              categoryId: typeof input.categoryId === 'number' ? input.categoryId : undefined,
              toAccountId: typeof input.toAccountId === 'number' ? input.toAccountId : undefined,
              date: typeof input.date === 'string' ? input.date : todayInputValue(),
              note: typeof input.note === 'string' ? input.note : '',
            })
            return { status: 'created', type, amount: input.amount }
          },
        },
        { signal: lifecycle.signal },
      )

      await context.registerTool(
        {
          name: 'list_accounts',
          title: 'List accounts',
          description: 'List Pocket Ledger account IDs and names before creating a transaction.',
          inputSchema: { type: 'object', properties: {}, additionalProperties: false },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          async execute() {
            const accounts = await db.accounts.toArray()
            return accounts.map(({ id, name, type }) => ({ id, name, type }))
          },
        },
        { signal: lifecycle.signal },
      )

      await context.registerTool(
        {
          name: 'set_monthly_budget',
          title: 'Set monthly budget',
          description: 'Create or update a monthly expense-category budget in Pocket Ledger.',
          inputSchema: {
            type: 'object',
            properties: {
              categoryId: { type: 'number' },
              month: { type: 'string', description: 'Month in YYYY-MM format.' },
              limit: { type: 'number', exclusiveMinimum: 0 },
            },
            required: ['categoryId', 'month', 'limit'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input) {
            if (!isRecord(input) || typeof input.categoryId !== 'number' || typeof input.month !== 'string' || typeof input.limit !== 'number') {
              throw new Error('categoryId, month, and limit are required.')
            }
            await saveBudget({ categoryId: input.categoryId, month: input.month, limit: input.limit })
            return { status: 'saved', categoryId: input.categoryId, month: input.month, limit: input.limit }
          },
        },
        { signal: lifecycle.signal },
      )

      await context.registerTool(
        {
          name: 'create_recurring_transaction',
          title: 'Create recurring transaction',
          description: 'Create a weekly, monthly, or yearly recurring income or expense in Pocket Ledger.',
          inputSchema: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['income', 'expense'] },
              amount: { type: 'number', exclusiveMinimum: 0 },
              categoryId: { type: 'number' },
              accountId: { type: 'number' },
              frequency: { type: 'string', enum: ['weekly', 'monthly', 'yearly'] },
              nextDate: { type: 'string', description: 'Date in YYYY-MM-DD format.' },
              note: { type: 'string' },
            },
            required: ['type', 'amount', 'categoryId', 'accountId', 'frequency', 'nextDate'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input) {
            if (
              !isRecord(input) ||
              !['income', 'expense'].includes(String(input.type)) ||
              typeof input.amount !== 'number' ||
              typeof input.categoryId !== 'number' ||
              typeof input.accountId !== 'number' ||
              !['weekly', 'monthly', 'yearly'].includes(String(input.frequency)) ||
              typeof input.nextDate !== 'string'
            ) {
              throw new Error('Invalid recurring transaction input.')
            }
            await saveRecurring({
              type: input.type as 'income' | 'expense',
              amount: input.amount,
              categoryId: input.categoryId,
              accountId: input.accountId,
              frequency: input.frequency as 'weekly' | 'monthly' | 'yearly',
              nextDate: input.nextDate,
              note: typeof input.note === 'string' ? input.note : '',
              active: true,
            })
            return { status: 'created', frequency: input.frequency, nextDate: input.nextDate }
          },
        },
        { signal: lifecycle.signal },
      )

      await context.registerTool(
        {
          name: 'create_goal',
          title: 'Create savings goal',
          description: 'Create a savings goal in Pocket Ledger.',
          inputSchema: {
            type: 'object',
            properties: { name: { type: 'string' }, targetAmount: { type: 'number', exclusiveMinimum: 0 }, savedAmount: { type: 'number', minimum: 0 }, targetDate: { type: 'string', description: 'Optional date in YYYY-MM-DD format.' } },
            required: ['name', 'targetAmount'], additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input) {
            if (!isRecord(input) || typeof input.name !== 'string' || typeof input.targetAmount !== 'number' || (input.savedAmount !== undefined && typeof input.savedAmount !== 'number') || (input.targetDate !== undefined && typeof input.targetDate !== 'string')) throw new Error('Invalid savings goal input.')
            await saveGoal({ name: input.name, targetAmount: input.targetAmount, savedAmount: input.savedAmount ?? 0, targetDate: input.targetDate })
            return { status: 'created', name: input.name }
          },
        },
        { signal: lifecycle.signal },
      )

      await context.registerTool(
        {
          name: 'create_bill',
          title: 'Create bill reminder',
          description: 'Create a bill reminder in Pocket Ledger.',
          inputSchema: {
            type: 'object',
            properties: { name: { type: 'string' }, amount: { type: 'number', exclusiveMinimum: 0 }, dueDate: { type: 'string', description: 'Date in YYYY-MM-DD format.' }, repeat: { type: 'string', enum: ['none', 'weekly', 'monthly', 'yearly'] }, accountId: { type: 'number' }, categoryId: { type: 'number' }, note: { type: 'string' } },
            required: ['name', 'amount', 'dueDate'], additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input) {
            if (!isRecord(input) || typeof input.name !== 'string' || typeof input.amount !== 'number' || typeof input.dueDate !== 'string' || (input.repeat !== undefined && !['none', 'weekly', 'monthly', 'yearly'].includes(String(input.repeat)))) throw new Error('Invalid bill input.')
            await saveBill({ name: input.name, amount: input.amount, dueDate: input.dueDate, repeat: (input.repeat as 'none' | 'weekly' | 'monthly' | 'yearly') ?? 'none', paid: false, accountId: typeof input.accountId === 'number' ? input.accountId : undefined, categoryId: typeof input.categoryId === 'number' ? input.categoryId : undefined, note: typeof input.note === 'string' ? input.note : '' })
            return { status: 'created', name: input.name, dueDate: input.dueDate }
          },
        },
        { signal: lifecycle.signal },
      )

      await context.registerTool(
        {
          name: 'create_subscription',
          title: 'Create subscription',
          description: 'Create a subscription tracker entry in Pocket Ledger.',
          inputSchema: {
            type: 'object',
            properties: { name: { type: 'string' }, amount: { type: 'number', exclusiveMinimum: 0 }, cycle: { type: 'string', enum: ['weekly', 'monthly', 'yearly'] }, nextBillingDate: { type: 'string', description: 'Date in YYYY-MM-DD format.' }, categoryId: { type: 'number' }, accountId: { type: 'number' }, status: { type: 'string', enum: ['active', 'paused', 'cancelled'] }, note: { type: 'string' } },
            required: ['name', 'amount', 'cycle', 'nextBillingDate', 'categoryId', 'accountId'], additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input) {
            if (!isRecord(input) || typeof input.name !== 'string' || typeof input.amount !== 'number' || !['weekly', 'monthly', 'yearly'].includes(String(input.cycle)) || typeof input.nextBillingDate !== 'string' || typeof input.categoryId !== 'number' || typeof input.accountId !== 'number' || (input.status !== undefined && !['active', 'paused', 'cancelled'].includes(String(input.status)))) throw new Error('Invalid subscription input.')
            await saveSubscription({ name: input.name, amount: input.amount, cycle: input.cycle as 'weekly' | 'monthly' | 'yearly', nextBillingDate: input.nextBillingDate, categoryId: input.categoryId, accountId: input.accountId, status: (input.status as 'active' | 'paused' | 'cancelled') ?? 'active', note: typeof input.note === 'string' ? input.note : '', color: '#2563eb' })
            return { status: 'created', name: input.name }
          },
        },
        { signal: lifecycle.signal },
      )
    }

    void register().catch(() => undefined)
    return () => lifecycle.abort()
  }, [])
}
