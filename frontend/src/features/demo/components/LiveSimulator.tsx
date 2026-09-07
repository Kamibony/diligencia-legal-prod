import { SosApp } from '../../sos/components/SosApp';
import { RadarDashboard } from '../../dispatch/components/RadarDashboard';

export const LiveSimulator = () => {
  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 overflow-hidden">
      {/* Sleek Header */}
      <header className="flex-none h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            Diligência Legal <span className="text-slate-400 font-normal">| Simulador Ao Vivo</span>
          </h1>
        </div>
        <button
          onClick={handleReset}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-slate-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Resetar Simulador
        </button>
      </header>

      {/* Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Client View (Mobile Mockup) */}
        <div className="w-1/2 flex items-center justify-center bg-slate-800/50 relative">
          <div className="absolute top-4 left-6 text-slate-400 font-medium text-sm">
            Visão do Cliente (App)
          </div>

          {/* Device Mockup */}
          <div className="relative w-[375px] h-[812px] bg-white border-[14px] border-slate-900 rounded-[3rem] shadow-2xl overflow-hidden ring-1 ring-slate-800/50">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-3xl w-40 mx-auto z-50"></div>

            {/* Embedded Component */}
            <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-red-50">
              <SosApp />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-slate-800 flex-none z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)] relative">
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 bg-slate-900 border border-slate-700 rounded-full p-1.5 shadow-lg">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </div>

        {/* Right Side: Lawyer View (Desktop) */}
        <div className="w-1/2 relative bg-slate-900 overflow-y-auto">
          <div className="absolute top-4 left-6 text-slate-400 font-medium text-sm z-50 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-sm border border-slate-700/50">
            Visão do Advogado (Dashboard)
          </div>
          <RadarDashboard />
        </div>
      </div>
    </div>
  );
};
