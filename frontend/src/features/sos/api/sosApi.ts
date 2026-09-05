import { api } from '../../../lib/api';

export interface CreateIncidentPayload {
  client_id: string;
  detainee_name: string;
  detainee_cpf?: string;
  latitude: number;
  longitude: number;
  document_base64: string;
  warrant_number?: string;
}

export const createIncident = async (payload: CreateIncidentPayload) => {
  const response = await api.post('/incidents', payload);
  return response.data;
};
