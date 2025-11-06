import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../api/user';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const user = getCurrentUser();

  if (!user) {
    // Not logged in → go to login
    return <Navigate to="/login" replace />;
  }

  // Logged in → allow access regardless of verification
  return children;
}
