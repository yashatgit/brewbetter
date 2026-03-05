import type { TimeOfDay } from '../types/database'

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${date} at ${time}`
}

export function calculateRatio(totalWater: number, coffeeDose: number): number {
  if (coffeeDose === 0) return 0
  return Math.round((totalWater / coffeeDose) * 10) / 10
}

export function formatBrewTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function parseBrewTime(timeStr: string): number {
  const [mins, secs] = timeStr.split(':').map(Number)
  return (mins || 0) * 60 + (secs || 0)
}

export function getTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours()
  if (hour < 12) return 'morning'
  if (hour < 14) return 'midday'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

export function daysOffRoast(brewDate: string, roastDate: string): number {
  const brew = new Date(brewDate)
  const roast = new Date(roastDate)
  return Math.floor((brew.getTime() - roast.getTime()) / (1000 * 60 * 60 * 24))
}
