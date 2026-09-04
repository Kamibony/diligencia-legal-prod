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
      <div className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'} max-h-[85vh] overflow-y-auto`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">Detalhes da Ocorrência</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 pb-24">
          {/* Header Info */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-semibold text-gray-900">{incident.detainee_name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPending ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {PT_BR.dispatch.status[incident.status as keyof typeof PT_BR.dispatch.status] || incident.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Registrado em: {new Date(incident.created_at).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* Legal Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <h4 className="font-semibold text-gray-700 border-b pb-2">Informações Legais</h4>

            {incident.warrant_number && (
              <div>
                <span className="block text-sm text-gray-500">Número do Mandado</span>
                <span className="block font-medium text-gray-900">{incident.warrant_number}</span>
              </div>
            )}

            {/* Extracted Data - fallback for now, as we don't have types for extracted_data yet but it exists on backend */}
            {(incident as any).extracted_data && Object.keys((incident as any).extracted_data).length > 0 && (
               <div>
                  <span className="block text-sm text-gray-500 mb-1">Dados Extraídos (OCR)</span>
                  <div className="bg-white p-3 rounded border text-sm text-gray-700 font-mono">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify((incident as any).extracted_data, null, 2)}
                    </pre>
                  </div>
               </div>
            )}

            {/* Fallback if no specific legal info */}
            {!incident.warrant_number && !(incident as any).extracted_data && (
              <p className="text-sm text-gray-500 italic">Nenhum detalhe legal adicional disponível.</p>
            )}
          </div>
        </div>

        {/* Action Bar */}
        {isPending && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className={`w-full py-3.5 text-white rounded-xl font-semibold text-lg transition-colors flex items-center justify-center ${
                isAccepting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
              }`}
            >
              {isAccepting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Aceitando...
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
