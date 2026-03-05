import { NextResponse } from 'next/server'
import { db } from '@server/db'
import { beanStats } from '@server/db/schema'

export async function GET() {
  const stats = db.select().from(beanStats).all()
  return NextResponse.json(stats)
}
