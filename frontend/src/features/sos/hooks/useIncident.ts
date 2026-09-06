import { useQuery } from '@tanstack/react-query';
import { getIncident } from '../api/sosApi';

export const useIncident = (incidentId: string | null) => {
  return useQuery({
    queryKey: ['incident', incidentId],
    queryFn: () => getIncident(incidentId!),
    enabled: !!incidentId,
    refetchInterval: (query) => {
      // Poll every 3 seconds while pending
      if (query.state.data && query.state.data.status === 'PENDING') {
        return 3000;
      }
      return false; // Stop polling when accepted or failed
    },
  });
};
