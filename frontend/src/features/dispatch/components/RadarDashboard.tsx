export const RadarDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Radar Dispatch Dashboard</h1>
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md overflow-hidden p-6 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-slate-200 h-24 w-24 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
        <p className="mt-6 text-gray-500">Searching for incidents...</p>
      </div>
    </div>
  );
};
