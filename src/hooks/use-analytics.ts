import { useQuery } from '@tanstack/react-query'
import type { BeanStats, PreferenceScore } from '../types/database'

const BASE_URL = '/api'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

export function useBeanStats() {
  return useQuery<BeanStats[]>({
    queryKey: ['bean-stats'],
    queryFn: () => fetchJson('/analytics/bean-stats'),
  })
}

export function usePreferenceScores() {
  return useQuery<PreferenceScore[]>({
    queryKey: ['preference-scores'],
    queryFn: () => fetchJson('/analytics/preferences'),
  })
}
