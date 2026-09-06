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
    const securityPin = activeIncidentId ? parseInt(activeIncidentId.substring(0, 8), 16).toString().slice(0, 4).padStart(4, '0') : '0000';

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

                  {/* Security PIN and Quick Actions */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-600 mb-6 shadow-inner text-center">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Código de Segurança / PIN</p>
                    <div className="flex justify-center gap-3 mb-4">
                      {securityPin.split('').map((digit, i) => (
                        <div key={i} className="w-12 h-14 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-md">
                          {digit}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center gap-4">
                       <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                         Ligar
                       </button>
                       <button className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors">
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                         WhatsApp
                       </button>
                    </div>
                  </div>

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
                  <p className="text-slate-400 text-sm mb-4">Notificando a rede de confiança num raio de 10km.</p>

                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-6">
                    <div className="bg-red-500 h-full w-1/3 animate-pulse rounded-full"></div>
                  </div>

                  {/* Network Status List */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 opacity-0 animate-[fadeIn_0.5s_ease-in-out_0.5s_forwards]">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                      <p className="text-slate-300 text-sm font-mono">Notificando: Silva & Costa (1.2 km)</p>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 animate-[fadeIn_0.5s_ease-in-out_1.5s_forwards]">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                      <p className="text-slate-300 text-sm font-mono">Notificando: Borges & Santos (3.4 km)</p>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 animate-[fadeIn_0.5s_ease-in-out_2.5s_forwards]">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                      <p className="text-slate-300 text-sm font-mono">Notificando: Lima Advogados (4.1 km)</p>
                    </div>
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
