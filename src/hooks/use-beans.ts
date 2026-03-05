import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useBeans() {
  return useQuery({
    queryKey: ['beans'],
    queryFn: () => api.getBeans(),
  })
}

export function useBean(id: string) {
  return useQuery({
    queryKey: ['beans', id],
    queryFn: () => api.getBean(id),
    enabled: !!id,
  })
}

export function useCreateBean() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => api.createBean(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beans'] })
    },
  })
}

export function useUpdateBean() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updateBean(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beans'] })
    },
  })
}

export function useDeleteBean() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteBean(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beans'] })
    },
  })
}
