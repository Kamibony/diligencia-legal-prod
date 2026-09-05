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
      </div>
    </div>
  );
};
