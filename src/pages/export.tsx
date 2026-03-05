import { useState } from 'react'
import { useBrewLogs } from '../hooks/use-brew-logs'
import { api } from '../lib/api'
import { downloadJson, downloadCsv } from '../lib/export'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Download } from 'lucide-react'
import type { BrewLogWithRelations } from '../types/database'

type ExportFormat = 'json' | 'csv'

export default function Export() {
  const [format, setFormat] = useState<ExportFormat>('json')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [exportError, setExportError] = useState('')

  const params: Record<string, string> = {}
  if (dateFrom) params.from = dateFrom
  if (dateTo) params.to = dateTo

  const { data: brews, isLoading } = useBrewLogs(
    Object.keys(params).length > 0 ? params : undefined
  )

  const brewList = (brews ?? []) as BrewLogWithRelations[]
  const count = brewList.length

  async function handleExport() {
    setIsExporting(true)
    try {
      const exportParams: Record<string, string> = {}
      if (dateFrom) exportParams.from = dateFrom
      if (dateTo) exportParams.to = dateTo

      const data = await api.exportData(format, exportParams)

      if (format === 'json') {
        downloadJson(data)
      } else {
        downloadCsv(data as unknown as string)
      }
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      console.error('Export failed:', err)
      setExportError('Export failed. Please try again.')
      setTimeout(() => setExportError(''), 5000)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-6 space-y-8 max-w-xl mx-auto animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-4xl md:text-5xl font-display italic text-espresso-900 tracking-tight leading-[0.95]">
          Export Data
        </h1>
        <p className="text-espresso-500 text-sm">
          Download your brew logs for safekeeping
        </p>
      </div>

      <div className="rounded-2xl border border-cream-200 bg-white paper-texture p-6 space-y-8">
        {/* Format Selection */}
        <fieldset className="space-y-3">
          <legend className="flex items-center gap-4 mb-1">
            <span className="text-sm font-display text-espresso-800 shrink-0">Export Format</span>
            <div className="flex-1 border-t border-cream-300" />
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {(['json', 'csv'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormat(fmt)}
                className={`rounded-xl border-2 p-5 text-center transition-all duration-250 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna-400 focus-visible:ring-offset-2 ${
                  format === fmt
                    ? 'border-sienna-500 bg-gradient-to-br from-espresso-800 to-espresso-900 shadow-lg scale-[1.02]'
                    : 'border-cream-200 bg-cream-50 hover:border-cream-300 hover:bg-cream-100'
                }`}
              >
                <span
                  className={`font-display text-lg font-bold tracking-tight ${
                    format === fmt ? 'text-cream-50' : 'text-espresso-600'
                  }`}
                >
                  {fmt.toUpperCase()}
                </span>
                <p
                  className={`text-xs mt-1.5 ${
                    format === fmt ? 'text-cream-300' : 'text-espresso-400'
                  }`}
                >
                  {fmt === 'json'
                    ? 'Structured data, great for backups'
                    : 'Spreadsheet-friendly format'}
                </p>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="From"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {/* Preview Count */}
        <div className="rounded-xl bg-cream-50 border border-cream-200 px-5 py-4">
          {isLoading ? (
            <p className="text-sm text-espresso-400 italic">Counting records...</p>
          ) : (
            <p className="text-sm text-espresso-600">
              <span className="font-display text-espresso-800 text-3xl md:text-4xl">
                {count}
              </span>{' '}
              brew log{count !== 1 ? 's' : ''} will be exported
              {(dateFrom || dateTo) && (
                <span className="text-espresso-400 block text-xs mt-1">
                  {dateFrom && `from ${dateFrom}`}
                  {dateFrom && dateTo && ' '}
                  {dateTo && `to ${dateTo}`}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Download */}
        <Button
          onClick={handleExport}
          disabled={isExporting || count === 0}
          size="lg"
          className="w-full bg-gradient-to-r from-sienna-600 to-sienna-700 hover:from-sienna-700 hover:to-sienna-800 text-white font-display text-lg py-4 inline-flex items-center justify-center gap-2.5 warm-glow rounded-xl"
        >
          <Download size={18} strokeWidth={2} className={isExporting ? 'animate-bounce' : ''} />
          {isExporting
            ? 'Exporting...'
            : `Download ${format.toUpperCase()}`}
        </Button>

        {/* Error state */}
        {exportError && (
          <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-rose-100 border border-rose-200 animate-fade-in-scale">
            <p className="text-sm font-medium text-rose-600">{exportError}</p>
          </div>
        )}

        {/* Success celebration */}
        {showSuccess && (
          <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-sage-100 border border-sage-200 animate-fade-in-scale">
            <svg width="24" height="24" viewBox="0 0 24 24" className="animate-check-circle">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage-500" />
              <path d="M8 12 L11 15 L16 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sage-600 animate-check-draw" />
            </svg>
            <p className="text-sm font-medium text-sage-700">
              Your data has been saved!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
