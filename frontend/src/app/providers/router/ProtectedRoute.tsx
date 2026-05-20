import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../entities/user/model/store';
import { UserRole } from '../../../shared/api/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuth, user } = useAuthStore();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
    // Redirect to a specific dashboard based on role if access denied
    const dashboardMap: Record<UserRole, string> = {
      [UserRole.ADMIN]: '/admin',
      [UserRole.COURIER]: '/courier',
      [UserRole.CLIENT]: '/client',
    };
    
    return <Navigate to={dashboardMap[user.role as UserRole]} replace />;
  }

  return <>{children}</>;
};
