const BASE_URL = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || res.statusText)
  }
  return res.json()
}

export const api = {
  // Beans
  getBeans: () => request<any[]>('/beans'),
  getBean: (id: string) => request<any>(`/beans/${id}`),
  createBean: (data: any) => request<any>('/beans', { method: 'POST', body: JSON.stringify(data) }),
  updateBean: (id: string, data: any) => request<any>(`/beans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBean: (id: string) => request<void>(`/beans/${id}`, { method: 'DELETE' }),

  // Equipment
  getEquipment: (type?: string) => request<any[]>(`/equipment${type ? `?type=${type}` : ''}`),
  createEquipment: (data: any) => request<any>('/equipment', { method: 'POST', body: JSON.stringify(data) }),
  updateEquipment: (id: string, data: any) => request<any>(`/equipment/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEquipment: (id: string) => request<void>(`/equipment/${id}`, { method: 'DELETE' }),

  // Brew Methods
  getBrewMethods: () => request<any[]>('/brew-methods'),
  getBrewMethod: (id: string) => request<any>(`/brew-methods/${id}`),

  // Brew Logs
  getBrewLogs: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<any[]>(`/brew-logs${query}`)
  },
  getBrewLog: (id: string) => request<any>(`/brew-logs/${id}`),
  createBrewLog: (data: any) => request<any>('/brew-logs', { method: 'POST', body: JSON.stringify(data) }),
  updateBrewLog: (id: string, data: any) => request<any>(`/brew-logs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBrewLog: (id: string) => request<void>(`/brew-logs/${id}`, { method: 'DELETE' }),

  // Tasting
  createTasting: (data: any) => request<any>('/tasting', { method: 'POST', body: JSON.stringify(data) }),
  updateTasting: (brewLogId: string, data: any) => request<any>(`/tasting/${brewLogId}`, { method: 'PUT', body: JSON.stringify(data) }),
  getTasting: (brewLogId: string) => request<any>(`/tasting/${brewLogId}`),

  // Saved Setups
  getSavedSetups: () => request<any[]>('/saved-setups'),
  createSavedSetup: (data: any) => request<any>('/saved-setups', { method: 'POST', body: JSON.stringify(data) }),
  updateSavedSetup: (id: string, data: any) => request<any>(`/saved-setups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSavedSetup: (id: string) => request<void>(`/saved-setups/${id}`, { method: 'DELETE' }),

  // Export
  exportData: (format: 'json' | 'csv', params?: Record<string, string>) => {
    const query = new URLSearchParams({ format, ...params }).toString()
    return request<any>(`/export?${query}`)
  },
}
