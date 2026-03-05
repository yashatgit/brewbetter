import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@server/db'
import { beans } from '@server/db/schema'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const bean = db.select().from(beans).where(eq(beans.id, id)).get()
  if (!bean) return NextResponse.json({ message: 'Bean not found' }, { status: 404 })
  return NextResponse.json(bean)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  db.update(beans).set(body).where(eq(beans.id, id)).run()
  const updated = db.select().from(beans).where(eq(beans.id, id)).get()
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  db.delete(beans).where(eq(beans.id, id)).run()
  return NextResponse.json({ success: true })
}
