import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@server/db'
import { equipment } from '@server/db/schema'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  db.update(equipment).set(body).where(eq(equipment.id, id)).run()
  const updated = db.select().from(equipment).where(eq(equipment.id, id)).get()
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  db.delete(equipment).where(eq(equipment.id, id)).run()
  return NextResponse.json({ success: true })
}
