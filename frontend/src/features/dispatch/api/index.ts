import { api } from '../../../lib/api';

export interface Incident {
  incident_id: string;
  client_id: string;
  detainee_name: string;
  status: string;
  latitude: number;
  longitude: number;
  created_at: string;
  lawyer_id?: string;
  warrant_number?: string;
  extracted_data?: Record<string, any>;
}

export const getNearbyIncidents = async (lat: number, lon: number, radius = 5000): Promise<Incident[]> => {
  const response = await api.get('/incidents/nearby', {
    params: { lat, lon, radius },
  });
  return response.data;
};

export const acceptIncident = async (incident_id: string, lawyer_id: string): Promise<void> => {
  await api.post(`/incidents/${incident_id}/accept`, { lawyer_id });
};
