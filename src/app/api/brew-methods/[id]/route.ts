import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@server/db'
import { brewMethods } from '@server/db/schema'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const method = db.select().from(brewMethods).where(eq(brewMethods.id, id)).get()
  if (!method) return NextResponse.json({ message: 'Method not found' }, { status: 404 })
  return NextResponse.json(method)
}
