import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export const BottomNavigation: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex-1 py-3 flex flex-col items-center justify-center space-y-1 ${
              isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
          <span className="text-xs font-medium">Radar</span>
        </NavLink>

        <NavLink
          to="/cases"
          className={({ isActive }) =>
            `flex-1 py-3 flex flex-col items-center justify-center space-y-1 ${
              isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs font-medium">Meus Casos</span>
        </NavLink>
      </nav>
    </div>
  );
};
