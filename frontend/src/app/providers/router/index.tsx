import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../../../pages/login';
import { RegisterPage } from '../../../pages/register';
import { ClientPage } from '../../../pages/client';
import { CourierPage } from '../../../pages/courier';
import { AdminPage } from '../../../pages/admin';
import { CouriersPage } from '../../../pages/admin/CouriersPage';
import { OrdersPage } from '../../../pages/admin/OrdersPage';
import { ApplicationsPage } from '../../../pages/admin/ApplicationsPage';
import { OrderDetailPage } from '../../../pages/client/OrderDetailPage';
import { CreateOrderPage } from '../../../pages/client/CreateOrderPage';
import { ActiveOrderPage } from '../../../pages/courier/ActiveOrderPage';
import { ProtectedRoute } from './ProtectedRoute';
import { UserRole } from '../../../shared/api/types';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/client',
    children: [
      {
        path: '',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
            <ClientPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'create',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
            <CreateOrderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
            <OrderDetailPage />
          </ProtectedRoute>
        ),
      }
    ]
  },
  {
    path: '/courier',
    children: [
      {
        path: '',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.COURIER]}>
            <CourierPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.COURIER]}>
            <ActiveOrderPage />
          </ProtectedRoute>
        ),
      }
    ]
  },
  {
    path: '/admin',
    children: [
      {
        path: '',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <OrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'couriers',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <CouriersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'applications',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <ApplicationsPage />
          </ProtectedRoute>
        ),
      }
    ]
  },
  {
    path: '/',
    element: <LoginPage />, // Default route
  },
], {
  future: {
    v7_startTransition: true,
  },
});
