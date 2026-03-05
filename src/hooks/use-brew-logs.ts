import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useBrewLogs(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['brew-logs', params],
    queryFn: () => api.getBrewLogs(params),
  })
}

export function useBrewLog(id: string) {
  return useQuery({
    queryKey: ['brew-logs', id],
    queryFn: () => api.getBrewLog(id),
    enabled: !!id,
  })
}

export function useCreateBrewLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => api.createBrewLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brew-logs'] })
    },
  })
}

export function useUpdateBrewLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateBrewLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brew-logs'] })
    },
  })
}

export function useDeleteBrewLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteBrewLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brew-logs'] })
    },
  })
}

export function useBrewMethods() {
  return useQuery({
    queryKey: ['brew-methods'],
    queryFn: () => api.getBrewMethods(),
  })
}
