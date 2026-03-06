import { useState } from 'react'
import { useBrewLogs } from '../hooks/use-brew-logs'
import { api } from '../lib/api'
import { downloadJson, downloadCsv } from '../lib/export'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
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
    <div className="p-6 space-y-8 max-w-2xl mx-auto animate-fade-in">
      <div className="space-y-1 text-center md:text-left">
        <p className="kicker">Data Management</p>
        <h1 className="text-4xl md:text-5xl font-display text-foreground tracking-tight leading-[0.95]">
          Export Data
        </h1>
        <p className="text-muted-foreground text-sm">
          Download your brew logs for safekeeping
        </p>
      </div>

      <Card className="space-y-8">
        {/* Format Selection */}
        <fieldset className="space-y-3">
          <legend className="flex items-center gap-4 mb-1">
            <span className="data-label shrink-0">Export Format</span>
            <div className="flex-1 border-t border-input" />
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {(['json', 'csv'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormat(fmt)}
                className={`select-card p-5 text-center ${
                  format === fmt ? 'select-card--active' : ''
                }`}
              >
                <span
                  className={`font-mono font-bold text-lg tracking-tight ${
                    format === fmt ? 'text-editorial' : 'text-secondary-foreground'
                  }`}
                >
                  {fmt.toUpperCase()}
                </span>
                <p className="text-xs mt-1.5 text-muted-foreground">
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
        <div className="bg-muted px-5 py-4 border-2 border-secondary">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Counting records...</p>
          ) : (
            <p className="text-sm text-secondary-foreground">
              <span className="font-display text-foreground text-3xl md:text-4xl data-value">
                {count}
              </span>{' '}
              brew log{count !== 1 ? 's' : ''} will be exported
              {(dateFrom || dateTo) && (
                <span className="text-muted-foreground block text-xs mt-1">
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
          className="w-full font-display text-lg py-4 inline-flex items-center justify-center gap-2.5"
        >
          <Download size={18} strokeWidth={2} className={isExporting ? 'animate-bounce' : ''} />
          {isExporting
            ? 'Exporting...'
            : `Download ${format.toUpperCase()}`}
        </Button>

        {/* Error state */}
        {exportError && (
          <div className="flex items-center justify-center gap-3 py-3 px-4 bg-destructive/10 border border-destructive/20 animate-fade-in-scale">
            <p className="text-sm font-medium text-destructive">{exportError}</p>
          </div>
        )}

        {/* Success celebration */}
        {showSuccess && (
          <div className="flex items-center justify-center gap-3 py-3 px-4 bg-success/10 border border-success/20 animate-fade-in-scale">
            <svg width="24" height="24" viewBox="0 0 24 24" className="animate-check-circle">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-success" />
              <path d="M8 12 L11 15 L16 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success animate-check-draw" />
            </svg>
            <p className="text-sm font-medium text-success">
              Your data has been saved!
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
