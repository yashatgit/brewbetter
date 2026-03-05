import { NextResponse } from 'next/server'
import { db } from '@server/db'
import { beanStats } from '@server/db/schema'
import { refreshBeanStats, refreshPreferenceScores } from '@server/lib/analytics'

export async function POST() {
  try {
    const allBeanIds = db
      .selectDistinct({ beanId: beanStats.beanId })
      .from(beanStats)
      .all()
      .map((r) => r.beanId)

    for (const beanId of allBeanIds) {
      refreshBeanStats(beanId)
    }

    refreshPreferenceScores()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ message: 'Failed to refresh analytics' }, { status: 500 })
  }
}
