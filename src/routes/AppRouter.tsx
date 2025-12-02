import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PigeonsPage from '../pages/PigeonsPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import ProtectedRoute from '../components/ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import TopBar from '../components/TopBar';
import CompetitionDetailsPage from '../pages/CompetitionDetailsPage';
import PigeonPage from '../pages/PigeonPage';
import BreedingSeasonDetailsPage from '../pages/BreedingDetailsPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      {/* TopBar is global */}
      <TopBar />

      <Routes>
        {/* PUBLIC pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* PROTECTED pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/lofts/:loftId/pigeons" element={<PigeonsPage />} />
          <Route path="/competitions/:competitionId" element={<CompetitionDetailsPage />}/>
          <Route path="/pigeons/:id" element={<PigeonPage />} />
          <Route path="/breeding/:id" element={<BreedingSeasonDetailsPage />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
