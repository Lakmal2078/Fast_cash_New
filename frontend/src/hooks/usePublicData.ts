import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export function usePublicData() {
  return useQuery({
    queryKey: ['landing'],
    queryFn: () => api.get('/public/landing').then((r) => r.data.data),
    staleTime: 60_000,
    retry: 2,
  });
}
