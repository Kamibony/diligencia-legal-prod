import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useMyCases } from '../hooks/useMyCases';
import { PT_BR } from '../../../locales/pt-BR';
import { IncidentDrawer } from '../../dispatch/components/IncidentDrawer';
import type { Incident } from '../../dispatch/api';

export const MyCasesDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  // Default to fallback if no user
  const lawyerId = user?.cpf || '12345678900';

  const { data: cases, isLoading, isError } = useMyCases(lawyerId);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10 px-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{PT_BR.cases.title}</h1>

      <div className="w-full max-w-lg space-y-4">
        {isLoading && !cases && (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
            </div>
            <p className="mt-4 text-gray-500">{PT_BR.cases.loading}</p>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow border border-red-200">
             {PT_BR.cases.error}
          </div>
        )}

        {cases && cases.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            {PT_BR.cases.empty}
          </div>
        )}

        {cases && cases.map((incident) => (
          <div key={incident.incident_id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-900">{incident.detainee_name}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                {PT_BR.dispatch.status[incident.status as keyof typeof PT_BR.dispatch.status] || incident.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Registrado em: {new Date(incident.created_at).toLocaleDateString('pt-BR')} {new Date(incident.created_at).toLocaleTimeString('pt-BR')}
            </p>
            <button
              className="w-full py-2 text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              onClick={() => handleIncidentClick(incident)}
            >
              {PT_BR.dispatch.viewDetails}
            </button>
          </div>
        ))}
      </div>

      <IncidentDrawer
        incident={selectedIncident}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
