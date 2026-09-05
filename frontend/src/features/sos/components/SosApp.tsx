import { useState } from 'react';
import { useCreateIncident } from '../hooks/useCreateIncident';
import { PT_BR } from '../../../locales/pt-BR';
import { type CreateIncidentPayload } from '../api/sosApi';

const DEFAULT_LAT = -7.11532;
const DEFAULT_LON = -34.86105;

export const SosApp = () => {
  const [showForm, setShowForm] = useState(false);
  const [incidentType, setIncidentType] = useState<string>(PT_BR.sos.incidentTypes.policeApproach);
  const [locationConfirm, setLocationConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createIncidentMutation = useCreateIncident();

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

  if (createIncidentMutation.isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 px-4">
         <div className="max-w-md w-full p-8 bg-white shadow-xl rounded-2xl text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">{PT_BR.sos.success}</h2>
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
