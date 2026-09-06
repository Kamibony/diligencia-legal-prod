import { useState } from 'react';
import { PT_BR } from '../../../locales/pt-BR';

export const MyPlan = () => {
  const [copied, setCopied] = useState(false);
  const sosLink = `${window.location.origin}/sos`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sosLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-600">{PT_BR.myPlan.title}</h1>
        <p className="text-gray-700 mb-6 font-medium">{PT_BR.myPlan.successMessage}</p>

        <div className="mb-6 text-left">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {PT_BR.myPlan.emergencyLink}
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={sosLink}
              className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-600 text-sm focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap transition-colors"
            >
              {copied ? PT_BR.myPlan.linkCopied : PT_BR.myPlan.copyLink}
            </button>
          </div>
        </div>

        {/* Value/Certificate Widget */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-5 rounded-xl shadow-sm relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-16 h-16 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="font-bold text-green-800">Impacto do Plano</h3>
            </div>
            <p className="text-green-700 text-sm font-medium leading-relaxed">
              Você economizou em média <span className="font-extrabold text-green-900 text-base bg-green-200/50 px-1 rounded">R$ 800</span> em honorários preventivos este ano.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
