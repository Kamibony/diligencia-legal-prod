import { useQuery } from '@tanstack/react-query';
import { getMyCases } from '../api';

export const useMyCases = (lawyer_id: string | null) => {
  return useQuery({
    queryKey: ['incidents', 'me', lawyer_id],
    queryFn: () => getMyCases(lawyer_id!),
    enabled: !!lawyer_id,
    refetchInterval: 10000, // Poll every 10 seconds for updates
  });
};
