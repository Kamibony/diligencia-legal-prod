import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MockGovBrLogin } from './features/auth/components/MockGovBrLogin';
import { RadarDashboard } from './features/dispatch/components/RadarDashboard';
import { MyCasesDashboard } from './features/cases/components/MyCasesDashboard';
import { BottomNavigation } from './components/BottomNavigation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<MockGovBrLogin />} />
        <Route element={<BottomNavigation />}>
          <Route path="/dashboard" element={<RadarDashboard />} />
          <Route path="/cases" element={<MyCasesDashboard />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
