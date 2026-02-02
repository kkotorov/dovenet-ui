import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import RegisterPage from '../pages/authentication/RegisterPage';
import LoginPage from '../pages/authentication/LoginPage';
import DashboardPage from '../pages/main/DashboardPage';
import ForgotPasswordPage from '../pages/authentication/ForgotPasswordPage';
import ResetPasswordPage from '../pages/authentication/ResetPasswordPage';
import VerifyEmailPage from '../pages/authentication/VerifyEmailPage';
import ProtectedRoute from '../components/utilities/ProtectedRoute';
import LandingPage from '../pages/main/LandingPage';
import TopBar from '../components/utilities/TopBar';
import CompetitionDetailsPage from '../pages/details/CompetitionDetailsPage';
import PigeonPage from '../pages/details/PigeonPage';
import BreedingSeasonDetailsPage from '../pages/details/BreedingDetailsPage';
import PublicPigeonPage from '../pages/details/PublicPigeonPage';
import PaymentSuccessPage from '../pages/main/PaymentSuccessPage';
import PaymentCancelPage from '../pages/main/PaymentCancelPage';

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
        <Route path="/public/pigeons/:id" element={<PublicPigeonPage />} />

        {/* PROTECTED pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/competitions/:competitionId" element={<CompetitionDetailsPage />}/>
          <Route path="/pigeons/:id" element={<PigeonPage />} />
          <Route path="/breeding/:id" element={<BreedingSeasonDetailsPage />} />
          <Route path="/billing/success" element={<PaymentSuccessPage />} />
          <Route path="/billing/cancel" element={<PaymentCancelPage />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
