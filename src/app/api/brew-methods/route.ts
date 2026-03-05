import { NextResponse } from 'next/server'
import { db } from '@server/db'
import { brewMethods } from '@server/db/schema'

export async function GET() {
  const all = db.select().from(brewMethods).all()
  return NextResponse.json(all)
}
