import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { resolve } from 'path'

const dbPath = resolve(import.meta.dirname, 'brew_better.db')
const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const sqliteDb = drizzle(sqlite, { schema })
