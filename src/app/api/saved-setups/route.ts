import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@server/db'
import { savedSetups } from '@server/db/schema'
import { v4 as uuid } from 'uuid'

export async function GET() {
  const all = db.select().from(savedSetups).all()
  return NextResponse.json(all)
}

export async function POST(request: Request) {
  const body = await request.json()
  const id = uuid()
  db.insert(savedSetups).values({ id, ...body }).run()
  const created = db.select().from(savedSetups).where(eq(savedSetups.id, id)).get()
  return NextResponse.json(created, { status: 201 })
}
