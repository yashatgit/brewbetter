import { sqliteDb } from './sqlite'
// import { postgresDb } from './postgres'

// DB_PROVIDER=sqlite (default) or DB_PROVIDER=postgres
export const db =
  process.env.DB_PROVIDER === 'postgres'
    ? (() => {
        throw new Error('Postgres not configured yet. Set DB_PROVIDER=sqlite or configure postgres.ts')
      })()
    : sqliteDb
