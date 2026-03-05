import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useTasting(brewLogId: string) {
  return useQuery({
    queryKey: ['tasting', brewLogId],
    queryFn: () => api.getTasting(brewLogId),
    enabled: !!brewLogId,
  })
}

export function useUpdateTasting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ brewLogId, data }: { brewLogId: string; data: any }) =>
      api.updateTasting(brewLogId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasting'] })
      queryClient.invalidateQueries({ queryKey: ['brew-logs'] })
    },
  })
}

export function useCreateTasting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => api.createTasting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasting'] })
      queryClient.invalidateQueries({ queryKey: ['brew-logs'] })
    },
  })
}
