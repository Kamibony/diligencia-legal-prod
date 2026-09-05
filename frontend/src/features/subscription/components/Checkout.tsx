import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PT_BR } from '../../../locales/pt-BR';

export const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let successTimer: number | undefined;

    if (loading) {
      successTimer = window.setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 2000);
    }

    return () => {
      if (successTimer) clearTimeout(successTimer);
    };
  }, [loading]);

  useEffect(() => {
    let redirectTimer: number | undefined;

    if (success) {
      redirectTimer = window.setTimeout(() => {
        navigate('/meu-plano');
      }, 1500);
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [success, navigate]);

  const handlePayment = () => {
    setLoading(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">{PT_BR.checkout.title}</h1>
        <p className="text-gray-600 mb-6">{PT_BR.checkout.description}</p>
        <div className="text-4xl font-extrabold text-blue-600 mb-8">
          {PT_BR.checkout.price}
        </div>

        {success ? (
          <div className="text-green-600 font-semibold text-lg animate-pulse">
            {PT_BR.checkout.successPayment}
          </div>
        ) : (
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-3 px-4 rounded font-bold text-white transition-colors ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? PT_BR.checkout.processingPayment : PT_BR.checkout.payWithPix}
          </button>
        )}
      </div>
    </div>
  );
};
