import { IncidentDrawer } from './IncidentDrawer';
import type { Incident } from '../api';
import { useState } from 'react';
import { useGeolocation } from '../../../utils/useGeolocation';
import { useIncidents } from '../hooks/useIncidents';
import { PT_BR } from '../../../locales/pt-BR';

export const RadarDashboard = () => {
  const { location, loading: geoLoading, error: geoError, usingFallback } = useGeolocation();
  const { data: incidents, isLoading: incidentsLoading, isError: incidentsError } = useIncidents(
    location?.lat ?? null,
    location?.lon ?? null
  );

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDrawerOpen(true);
  };


  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center pt-10 px-4 pb-20 relative overflow-hidden">

      {/* Simulated Glowing Map Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Financial/Shift Widget */}
      <div className="absolute top-6 right-6 z-20">
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-600/50 p-3 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-xl">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-300 text-[10px] uppercase font-bold tracking-wider mb-0.5">Plantão Atual: 2 Casos</p>
            <p className="text-white text-sm font-black tracking-wide">Potencial de Honorários: <span className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">R$ 3.500,00</span></p>
          </div>
        </div>
      </div>

      {/* Pulsing Radar Center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative flex justify-center items-center">
          <div className="absolute w-96 h-96 bg-green-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute w-64 h-64 bg-green-500/20 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
          <div className="absolute w-32 h-32 border border-green-500/30 rounded-full"></div>
          <div className="absolute w-64 h-64 border border-green-500/20 rounded-full"></div>
          <div className="absolute w-96 h-96 border border-green-500/10 rounded-full"></div>
          <div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_15px_5px_rgba(34,197,94,0.5)]"></div>
        </div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-lg mb-6">
          <h1 className="text-3xl font-black text-white tracking-wide uppercase drop-shadow-md">{PT_BR.dispatch.title}</h1>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold uppercase tracking-wider ${isOnline ? 'text-green-400' : 'text-slate-500'}`}>
              {isOnline ? 'Em Plantão' : 'Offline'}
            </span>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isOnline ? 'bg-green-500' : 'bg-slate-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {geoLoading && (
          <p className="text-sm text-slate-400 mb-6 font-mono">{PT_BR.dispatch.obtainingLocation}</p>
        )}

        {usingFallback && (
          <div className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 text-xs px-4 py-1.5 rounded-full mb-6 font-medium backdrop-blur-sm">
            {PT_BR.dispatch.usingFallback}
          </div>
        )}

        {geoError && !usingFallback && (
          <div className="bg-red-500/20 text-red-300 border border-red-500/50 p-3 rounded mb-6 text-sm backdrop-blur-sm font-medium">
            {PT_BR.dispatch.locationError}{geoError}
          </div>
        )}

        <div className="w-full max-w-lg space-y-4">
          {incidentsLoading && !incidents && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl shadow-lg p-6 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-slate-700 h-16 w-16 mb-4"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
              </div>
              <p className="mt-4 text-slate-400 font-mono">{PT_BR.dispatch.searchingIncidents}</p>
            </div>
          )}

          {incidentsError && (
            <div className="bg-red-900/30 text-red-400 p-4 rounded-xl shadow border border-red-800/50 backdrop-blur-sm">
              {PT_BR.dispatch.failedFetch}
            </div>
          )}

          {incidents && incidents.length === 0 && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl shadow p-6 text-center text-slate-400 font-mono">
              {PT_BR.dispatch.noIncidents}
            </div>
          )}

          {incidents && incidents.map((incident) => (
            <div key={incident.incident_id} className="bg-slate-800/60 backdrop-blur-md rounded-xl shadow-lg p-5 border border-slate-700 hover:border-slate-500 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-white">{incident.detainee_name}</h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  incident.status === 'PENDING' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                }`}>
                  {PT_BR.dispatch.status[incident.status as keyof typeof PT_BR.dispatch.status] || incident.status}
                </span>
              </div>
              <div className="flex flex-col gap-1 mb-4">
                <p className="text-sm text-slate-400 font-mono">
                  {PT_BR.dispatch.created}{new Date(incident.created_at).toLocaleTimeString()}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {incident.incident_id.substring(0, 8)}...
                </p>
              </div>
              <button
                className={`w-full py-2.5 rounded-lg font-bold uppercase tracking-widest transition-all ${
                  incident.status === 'PENDING'
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_10px_rgba(22,163,74,0.4)]'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
                onClick={() => incident.status === 'PENDING' && handleIncidentClick(incident)}
                disabled={incident.status !== 'PENDING'}
              >
                {PT_BR.dispatch.viewDetails}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Dispatch Log Overlay */}
      <div className="fixed bottom-4 left-4 z-50 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl max-w-xs text-xs font-mono w-64 pointer-events-none">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-slate-300 font-bold tracking-wider">SYSTEM_LOG</span>
        </div>
        <div className="space-y-1.5 h-20 overflow-hidden relative">
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-900/90 to-transparent z-10"></div>
          <p className="text-slate-400 animate-[fadeIn_0.5s_ease-in-out_0s_forwards]">[System] Estabelecendo conexão segura...</p>
          <p className="text-blue-400 animate-[fadeIn_0.5s_ease-in-out_2s_forwards]">[System] Monitorando setor Manaíra...</p>
          <p className="text-green-400 animate-[fadeIn_0.5s_ease-in-out_4s_forwards]">[System] Rede de confiança ativa.</p>
        </div>
      </div>

      <IncidentDrawer
        incident={selectedIncident}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
