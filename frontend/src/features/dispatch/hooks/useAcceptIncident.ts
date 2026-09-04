import { useMutation, useQueryClient } from '@tanstack/react-query';
import { acceptIncident } from '../api';

export const useAcceptIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ incident_id, lawyer_id }: { incident_id: string; lawyer_id: string }) =>
      acceptIncident(incident_id, lawyer_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents', 'nearby'] });
    },
  });
};
