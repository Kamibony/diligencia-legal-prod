import React from 'react';
import type { Incident } from '../api';
import { PT_BR } from '../../../locales/pt-BR';
import { useAcceptIncident } from '../hooks/useAcceptIncident';
import { useAuthStore } from '../../../store/authStore';

interface IncidentDrawerProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export const IncidentDrawer: React.FC<IncidentDrawerProps> = ({ incident, isOpen, onClose }) => {
  const acceptIncidentMutation = useAcceptIncident();
  const user = useAuthStore((state) => state.user);

  if (!isOpen || !incident) return null;

  const handleAccept = () => {
    const lawyerId = user?.cpf || '12345678900';
    acceptIncidentMutation.mutate(
      { incident_id: incident.incident_id, lawyer_id: lawyerId },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  const isPending = incident.status === 'PENDING';
  const isAccepting = acceptIncidentMutation.isPending;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)] z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'} max-h-[90vh] overflow-y-auto`}>

        {/* Drag handle pill */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-slate-900 z-10 rounded-t-3xl">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full"></div>
        </div>

        <div className="p-4 border-b border-slate-800 flex justify-between items-center sticky top-5 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-white tracking-wide uppercase">Detalhes da Ocorrência</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 pb-32">
          {/* Header Info */}
          <div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-2xl font-black text-white">{incident.detainee_name}</h3>
              <span className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider border ${
                isPending ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {PT_BR.dispatch.status[incident.status as keyof typeof PT_BR.dispatch.status] || incident.status}
              </span>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-2 mb-4">
               <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                 </svg>
                 Círculo de Confiança - Plano Ativo
               </span>
            </div>

            <p className="text-sm text-slate-400 font-mono">
              Registrado em: {new Date(incident.created_at).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* Telemetry Mock Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <svg className="w-6 h-6 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span className="text-2xl font-bold text-white tracking-tight">2.4 <span className="text-sm font-medium text-slate-400">km</span></span>
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1">Distância</span>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <svg className="w-6 h-6 text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-2xl font-bold text-white tracking-tight">6 <span className="text-sm font-medium text-slate-400">min</span></span>
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1">ETA</span>
            </div>

            <div className="col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
               <div className="p-2 bg-slate-700 rounded-lg">
                 <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                 </svg>
               </div>
               <div>
                 <span className="block text-white font-medium">Av. João Câncio da Silva, Manaíra</span>
                 <span className="block text-xs text-slate-500 font-mono">João Pessoa, PB</span>
               </div>
            </div>
          </div>

          {/* Legal Details */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
            <h4 className="font-bold text-slate-300 border-b border-slate-700 pb-2 uppercase tracking-wide text-sm">Informações Legais</h4>

            {incident.warrant_number && (
              <div>
                <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Número do Mandado</span>
                <span className="block font-mono text-white bg-slate-900 p-2 rounded border border-slate-700">{incident.warrant_number}</span>
              </div>
            )}

            {/* Extracted Data - fallback for now, as we don't have types for extracted_data yet but it exists on backend */}
            {(incident as any).extracted_data && Object.keys((incident as any).extracted_data).length > 0 && (
               <div>
                  <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Dados Extraídos (OCR)</span>
                  <div className="bg-slate-900 p-3 rounded border border-slate-700 text-sm text-green-400 font-mono">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify((incident as any).extracted_data, null, 2)}
                    </pre>
                  </div>
               </div>
            )}

            {/* Fallback if no specific legal info */}
            {!incident.warrant_number && !(incident as any).extracted_data && (
              <p className="text-sm text-slate-500 italic font-mono">Nenhum detalhe legal adicional disponível.</p>
            )}
          </div>

          {/* Lawyer Branding (Visible if accepted, or just as a signature) */}
          <div className="flex justify-center pt-4">
             <div className="text-center">
               <p className="text-slate-400 text-sm font-medium">Escritório Lima & Associados</p>
               <p className="text-slate-600 text-xs font-mono">OAB/PB 14.200</p>
             </div>
          </div>

        </div>

        {/* Action Bar */}
        {isPending && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800">
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className={`w-full py-4 text-white rounded-xl font-black text-lg tracking-widest uppercase transition-all flex items-center justify-center ${
                isAccepting ? 'bg-green-800 text-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_25px_rgba(22,163,74,0.5)]'
              }`}
            >
              {isAccepting ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-green-300" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assumindo...
                </span>
              ) : (
                'Assumir Caso'
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};
