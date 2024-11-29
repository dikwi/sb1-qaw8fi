import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AuthRouteProps {
  children: React.ReactNode;
  type: 'private' | 'public';
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children, type }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // For private routes, redirect to login if not authenticated
  if (type === 'private' && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // For public routes (login/register), redirect to HealthFacility if already authenticated
  if (type === 'public' && isAuthenticated) {
    return <Navigate to="/invoicing" replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;