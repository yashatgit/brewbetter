'use client'

import { Suspense } from 'react'
import NewBrew from '@/views/new-brew'

export default function NewBrewPage() {
  return (
    <Suspense>
      <NewBrew />
    </Suspense>
  )
}
