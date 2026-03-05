import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@server/db'
import { savedSetups } from '@server/db/schema'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  db.update(savedSetups).set(body).where(eq(savedSetups.id, id)).run()
  const updated = db.select().from(savedSetups).where(eq(savedSetups.id, id)).get()
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  db.delete(savedSetups).where(eq(savedSetups.id, id)).run()
  return NextResponse.json({ success: true })
}
