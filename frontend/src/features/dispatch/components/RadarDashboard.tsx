import { useGeolocation } from '../../../utils/useGeolocation';
import { useIncidents } from '../hooks/useIncidents';
import { PT_BR } from '../../../locales/pt-BR';

export const RadarDashboard = () => {
  const { location, loading: geoLoading, error: geoError, usingFallback } = useGeolocation();
  const { data: incidents, isLoading: incidentsLoading, isError: incidentsError } = useIncidents(
    location?.lat ?? null,
    location?.lon ?? null
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10 px-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{PT_BR.dispatch.title}</h1>

      {geoLoading && (
        <p className="text-sm text-gray-500 mb-6">{PT_BR.dispatch.obtainingLocation}</p>
      )}

      {usingFallback && (
        <div className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full mb-6">
          {PT_BR.dispatch.usingFallback}
        </div>
      )}

      {geoError && !usingFallback && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-6 text-sm">
          {PT_BR.dispatch.locationError}{geoError}
        </div>
      )}

      <div className="w-full max-w-lg space-y-4">
        {incidentsLoading && !incidents && (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-slate-200 h-16 w-16 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
            </div>
            <p className="mt-4 text-gray-500">{PT_BR.dispatch.searchingIncidents}</p>
          </div>
        )}

        {incidentsError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow border border-red-200">
            {PT_BR.dispatch.failedFetch}
          </div>
        )}

        {incidents && incidents.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            {PT_BR.dispatch.noIncidents}
          </div>
        )}

        {incidents && incidents.map((incident) => (
          <div key={incident.incident_id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-900">{incident.detainee_name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                incident.status === 'PENDING' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {PT_BR.dispatch.status[incident.status as keyof typeof PT_BR.dispatch.status] || incident.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {PT_BR.dispatch.created}{new Date(incident.created_at).toLocaleTimeString()}
            </p>
            <button className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
              {PT_BR.dispatch.acceptIncident}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
