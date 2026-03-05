import { type NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@server/db'
import { equipment } from '@server/db/schema'
import { v4 as uuid } from 'uuid'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')
  if (type) {
    const items = db.select().from(equipment).where(eq(equipment.type, type as any)).all()
    return NextResponse.json(items)
  }
  const items = db.select().from(equipment).all()
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const body = await request.json()
  const id = uuid()
  db.insert(equipment).values({ id, ...body }).run()
  const created = db.select().from(equipment).where(eq(equipment.id, id)).get()
  return NextResponse.json(created, { status: 201 })
}
