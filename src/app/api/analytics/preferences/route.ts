import { NextResponse } from 'next/server'
import { db } from '@server/db'
import { preferenceScores } from '@server/db/schema'

export async function GET() {
  const scores = db.select().from(preferenceScores).all()
  return NextResponse.json(scores)
}
