import { useState, useEffect } from 'react';
import { useCreateIncident } from '../hooks/useCreateIncident';
import { useIncident } from '../hooks/useIncident';
import { PT_BR } from '../../../locales/pt-BR';
import { type CreateIncidentPayload } from '../api/sosApi';

const DEFAULT_LAT = -7.11532;
const DEFAULT_LON = -34.86105;

export const SosApp = () => {
  const [showForm, setShowForm] = useState(false);
  const [incidentType, setIncidentType] = useState<string>(PT_BR.sos.incidentTypes.policeApproach);
  const [locationConfirm, setLocationConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);

  const createIncidentMutation = useCreateIncident();
  const { data: incidentData } = useIncident(activeIncidentId);

  useEffect(() => {
    if (createIncidentMutation.isSuccess && createIncidentMutation.data?.incident_id) {
      setActiveIncidentId(createIncidentMutation.data.incident_id);
    }
  }, [createIncidentMutation.isSuccess, createIncidentMutation.data]);

  const handleSOSClick = () => {
    setShowForm(true);
  };

  const getCoordinates = (): Promise<{ lat: number, lon: number }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          resolve({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
        }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationConfirm) {
      setErrorMsg("Você deve permitir o compartilhamento da localização.");
      return;
    }

    setErrorMsg(null);
    const coords = await getCoordinates();

    const payload: CreateIncidentPayload = {
      client_id: "family_client_id_mock", // mocked
      detainee_name: incidentType, // Store type in detainee_name for MVP if needed, or pass as warrant_number
      latitude: coords.lat,
      longitude: coords.lon,
      document_base64: "c29zX2RvY3VtZW50X21vY2s=", // Base64 of "sos_document_mock"
      warrant_number: incidentType,
    };

    createIncidentMutation.mutate(payload);
  };

  if (activeIncidentId) {
    const isAccepted = incidentData?.status === 'ACCEPTED';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4">
         <div className="max-w-md w-full p-8 bg-slate-800 shadow-2xl rounded-3xl border border-slate-700 text-center relative overflow-hidden">
            {/* Pulse effect background */}
            {!isAccepted && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-64 h-64 rounded-full border-4 border-red-500 animate-ping"></div>
              </div>
            )}

            <div className="relative z-10">
              {isAccepted ? (
                <>
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Advogado a caminho</h2>
                  <p className="text-green-400 font-medium mb-6">ETA: 6 min</p>

                  <div className="bg-slate-700/50 p-4 rounded-xl text-left border border-slate-600">
                    <p className="text-slate-300 text-sm mb-1">Assumido por:</p>
                    <p className="text-white font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      Escritório Lima & Associados
                    </p>
                    <p className="text-slate-400 text-xs mt-1">OAB/PB 14.200</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/50 relative">
                     <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-pulse"></div>
                     <svg className="w-10 h-10 text-white animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Procurando advogado...</h2>
                  <p className="text-slate-400 text-sm mb-8">Notificando a rede de confiança num raio de 10km.</p>

                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full w-1/3 animate-pulse rounded-full"></div>
                  </div>
                </>
              )}
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-xl rounded-2xl border border-red-100 text-center">
        {!showForm ? (
          <div>
            <h1 className="text-3xl font-extrabold text-red-600 mb-8">SOS Familiar</h1>
            <button
              onClick={handleSOSClick}
              className="w-48 h-48 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-2xl shadow-2xl transition-transform hover:scale-105 flex items-center justify-center mx-auto"
            >
              {PT_BR.sos.buttonTitle}
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-red-600 mb-6">{PT_BR.sos.formTitle}</h2>
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {PT_BR.sos.incidentTypeLabel}
                </label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-red-500 focus:border-red-500"
                >
                  {Object.values(PT_BR.sos.incidentTypes).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="locationConfirm"
                    type="checkbox"
                    checked={locationConfirm}
                    onChange={(e) => setLocationConfirm(e.target.checked)}
                    className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="locationConfirm" className="font-medium text-gray-700">
                    {PT_BR.sos.locationConfirm}
                  </label>
                </div>
              </div>

              {errorMsg && (
                <div className="text-red-500 text-sm mt-2">{errorMsg}</div>
              )}
              {createIncidentMutation.isError && (
                <div className="text-red-500 text-sm mt-2">{PT_BR.sos.error}</div>
              )}

              <button
                type="submit"
                disabled={createIncidentMutation.isPending}
                className="w-full flex justify-center py-3 px-6 border border-transparent text-base font-bold rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {createIncidentMutation.isPending ? PT_BR.sos.creating : PT_BR.sos.submit}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
