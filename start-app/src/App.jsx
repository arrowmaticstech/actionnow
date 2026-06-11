import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import FullReports from './pages/FullReports';
import HomePage from './pages/HomePage';

export default function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <BrowserRouter basename={base}>
      <Routes>
        <Route index element={<Navigate to="/main" replace />} />
        <Route path="main" element={<HomePage />} />
        <Route path="full-reports" element={<FullReports />} />
        <Route path="*" element={<Navigate to="/main" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
