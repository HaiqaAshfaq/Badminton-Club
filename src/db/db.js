import { openDB } from 'idb'

const DB_NAME = 'makki-club-db'
const DB_VERSION = 1

export const STORES = {
  members: 'members',
  months: 'months',
  payments: 'payments',
  fines: 'fines',
  expenses: 'expenses',
  activity: 'activity',
  meta: 'meta',
}

let dbPromise = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.members)) {
          db.createObjectStore(STORES.members, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.months)) {
          db.createObjectStore(STORES.months, { keyPath: 'id' }) // id = "YYYY-MM"
        }
        if (!db.objectStoreNames.contains(STORES.payments)) {
          const s = db.createObjectStore(STORES.payments, { keyPath: 'id' })
          s.createIndex('byMonth', 'monthId')
          s.createIndex('byMember', 'memberId')
        }
        if (!db.objectStoreNames.contains(STORES.fines)) {
          const s = db.createObjectStore(STORES.fines, { keyPath: 'id' })
          s.createIndex('byMember', 'memberId')
          s.createIndex('byStatus', 'status')
        }
        if (!db.objectStoreNames.contains(STORES.expenses)) {
          const s = db.createObjectStore(STORES.expenses, { keyPath: 'id' })
          s.createIndex('byMonth', 'monthId')
        }
        if (!db.objectStoreNames.contains(STORES.activity)) {
          db.createObjectStore(STORES.activity, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.meta)) {
          db.createObjectStore(STORES.meta, { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}

export async function getAll(store) {
  const db = await getDB()
  return db.getAll(store)
}

export async function put(store, value) {
  const db = await getDB()
  return db.put(store, value)
}

export async function bulkPut(store, values) {
  const db = await getDB()
  const tx = db.transaction(store, 'readwrite')
  await Promise.all(values.map((v) => tx.store.put(v)))
  await tx.done
}

export async function remove(store, id) {
  const db = await getDB()
  return db.delete(store, id)
}

export async function getByIndex(store, index, value) {
  const db = await getDB()
  return db.getAllFromIndex(store, index, value)
}

export async function clearAll() {
  const db = await getDB()
  const names = Object.values(STORES)
  const tx = db.transaction(names, 'readwrite')
  await Promise.all(names.map((n) => tx.objectStore(n).clear()))
  await tx.done
}

export async function exportAllData() {
  const db = await getDB()
  const names = Object.values(STORES)
  const data = {}
  for (const n of names) {
    data[n] = await db.getAll(n)
  }
  data.exportedAt = new Date().toISOString()
  data.version = DB_VERSION
  return data
}

export async function importAllData(data) {
  await clearAll()
  const db = await getDB()
  for (const store of Object.values(STORES)) {
    if (Array.isArray(data[store]) && data[store].length) {
      const tx = db.transaction(store, 'readwrite')
      await Promise.all(data[store].map((v) => tx.store.put(v)))
      await tx.done
    }
  }
}
