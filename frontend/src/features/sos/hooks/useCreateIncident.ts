import { useMutation } from '@tanstack/react-query';
import { createIncident, type CreateIncidentPayload } from '../api/sosApi';

export const useCreateIncident = () => {
  return useMutation({
    mutationFn: (payload: CreateIncidentPayload) => createIncident(payload),
  });
};
