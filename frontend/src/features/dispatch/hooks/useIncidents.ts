import { useQuery } from '@tanstack/react-query';
import { getNearbyIncidents } from '../api';

export const useIncidents = (lat: number | null, lon: number | null) => {
  return useQuery({
    queryKey: ['incidents', 'nearby', lat, lon],
    queryFn: () => getNearbyIncidents(lat!, lon!),
    enabled: lat !== null && lon !== null,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 2000,
  });
};
