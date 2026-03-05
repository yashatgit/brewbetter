export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadJson(data: unknown, filename = 'brew_better_export.json') {
  downloadFile(JSON.stringify(data, null, 2), filename, 'application/json')
}

export function downloadCsv(csvContent: string, filename = 'brew_better_export.csv') {
  downloadFile(csvContent, filename, 'text/csv')
}
