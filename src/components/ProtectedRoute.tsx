import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../api/user';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = getCurrentUser();

  if (!user) {
    // Not logged in → go to login
    return <Navigate to="/login" replace />;
  }

  // Logged in → allow access
  return <>{children}</>;
}
