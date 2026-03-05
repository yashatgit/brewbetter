import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useSavedSetups() {
  return useQuery({
    queryKey: ['saved-setups'],
    queryFn: () => api.getSavedSetups(),
  })
}

export function useCreateSavedSetup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => api.createSavedSetup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-setups'] })
    },
  })
}

export function useUpdateSavedSetup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updateSavedSetup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-setups'] })
    },
  })
}

export function useDeleteSavedSetup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteSavedSetup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-setups'] })
    },
  })
}
