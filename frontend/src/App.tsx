import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MockGovBrLogin } from './features/auth/components/MockGovBrLogin';
import { RadarDashboard } from './features/dispatch/components/RadarDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<MockGovBrLogin />} />
        <Route path="/dashboard" element={<RadarDashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
