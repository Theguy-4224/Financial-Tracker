import { useEffect, useState } from 'react'
import { db } from '../db/database'
import type { Category } from '../db/types'

type DatabaseState =
  | { status: 'loading'; categories: Category[]; message: string }
  | { status: 'ready'; categories: Category[]; message: string }
  | { status: 'error'; categories: Category[]; message: string }

const initialState: DatabaseState = {
  status: 'loading',
  categories: [],
  message: 'Preparing your private local database…',
}

export function useDatabaseSetup(): DatabaseState {
  const [state, setState] = useState<DatabaseState>(initialState)

  useEffect(() => {
    let isMounted = true

    async function prepareDatabase() {
      try {
        await db.open()
        const categories = await db.categories.orderBy('id').toArray()

        if (isMounted) {
          setState({
            status: 'ready',
            categories,
            message: 'Local database ready',
          })
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown database error'

        if (isMounted) {
          setState({
            status: 'error',
            categories: [],
            message: `Could not open the local database: ${message}`,
          })
        }
      }
    }

    void prepareDatabase()

    return () => {
      isMounted = false
    }
  }, [])

  return state
}
