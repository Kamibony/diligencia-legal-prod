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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {PT_BR.auth.mockLoginTitle}
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleLogin}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {PT_BR.auth.loginButton}
          </button>
        </div>
      </div>
    </div>
  );
};
