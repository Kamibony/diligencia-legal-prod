import { api } from '../../../lib/api';
import type { Incident } from '../../dispatch/api';

export const getMyCases = async (lawyer_id: string): Promise<Incident[]> => {
  const response = await api.get('/incidents/me', {
    params: { lawyer_id },
  });
  return response.data;
};
