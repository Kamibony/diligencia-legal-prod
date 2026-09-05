import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { PT_BR } from '../../../locales/pt-BR';

export const MockGovBrLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleLogin = () => {
    login("Lawyer User", "12345678900");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-[#1351b4] mb-2 tracking-tight">
            {PT_BR.auth.systemName}
          </h1>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {PT_BR.auth.welcomeTitle}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {PT_BR.auth.welcomeSubtitle}
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <button
            onClick={handleLogin}
            className="w-full flex justify-center py-3 px-6 border border-transparent text-base font-bold rounded-full text-white bg-[#1351b4] hover:bg-[#0c326f] shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1351b4]"
          >
            {PT_BR.auth.loginButton}
          </button>

          <div className="text-xs text-center text-gray-400 mt-4">
             {PT_BR.auth.mockLoginTitle}
          </div>
        </div>
      </div>
    </div>
  );
};
