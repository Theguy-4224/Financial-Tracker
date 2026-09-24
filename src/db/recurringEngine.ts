import { db } from './database'
import { advanceRecurringDate } from '../lib/recurrence'
import { todayInputValue } from '../lib/date'

export async function processDueRecurringTransactions(today = todayInputValue()) {
  const dueItems = await db.recurring.filter((item) => item.active).toArray()
  let created = 0

  await db.transaction('rw', db.recurring, db.transactions, async () => {
    for (const item of dueItems) {
      if (!item.id) continue
      let nextDate = item.nextDate
      let iterations = 0

      while (nextDate <= today && iterations < 120) {
        await db.transactions.add({
          type: item.type,
          amount: item.amount,
          categoryId: item.categoryId,
          accountId: item.accountId,
          date: nextDate,
          note: item.note,
          recurringId: item.id,
        })
        created += 1
        iterations += 1
        nextDate = advanceRecurringDate(nextDate, item.frequency, item.anchorDay)
      }

      if (nextDate !== item.nextDate) {
        await db.recurring.update(item.id, { nextDate })
      }
    }
  })

  return created
}

export async function processDueSubscriptions(today = todayInputValue()) {
  const dueItems = await db.subscriptions.filter((item) => item.status === 'active').toArray()
  await db.transaction('rw', db.subscriptions, db.transactions, async () => {
    for (const item of dueItems) {
      if (!item.id) continue
      let nextDate = item.nextBillingDate
      let iterations = 0
      while (nextDate <= today && iterations < 120) {
        await db.transactions.add({
          type: 'expense', amount: item.amount, categoryId: item.categoryId, accountId: item.accountId,
          date: nextDate, note: item.note || item.name, subscriptionId: item.id,
        })
        iterations += 1
        nextDate = advanceRecurringDate(nextDate, item.cycle, item.anchorDay)
      }
      if (nextDate !== item.nextBillingDate) await db.subscriptions.update(item.id, { nextBillingDate: nextDate })
    }
  })
}
