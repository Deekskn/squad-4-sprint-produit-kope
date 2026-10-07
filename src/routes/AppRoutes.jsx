import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/shared/components/layout/RootLayout.jsx';
import { RoleRoute } from './RoleRoute.jsx';
import { ROLES, ROUTES } from '@/shared/lib/constants.js';

import { HomePage } from '@/pages/HomePage.jsx';
import { HowItWorksPage } from '@/pages/HowItWorksPage.jsx';
import { NotFoundPage } from '@/pages/NotFoundPage.jsx';
import { ForbiddenPage } from '@/pages/ForbiddenPage.jsx';
import { RouteErrorPage } from '@/pages/RouteErrorPage.jsx';
import { AuthModalRedirect } from '@/features/auth/pages/AuthModalRedirect.jsx';
import { SearchPage } from '@/features/search/pages/SearchPage.jsx';
import { ProfessionalPublicPage } from '@/features/professionals/pages/ProfessionalPublicPage.jsx';
import { ClientDashboardPage } from '@/pages/dashboard/ClientDashboardPage.jsx';
import { ProProfilePage } from '@/features/professionals/pages/ProProfilePage.jsx';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage.jsx';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.HOW_IT_WORKS, element: <HowItWorksPage /> },
      { path: ROUTES.SEARCH, element: <SearchPage /> },
      { path: '/professionals/:id', element: <ProfessionalPublicPage /> },
      { path: ROUTES.LOGIN, element: <AuthModalRedirect mode="login" /> },
      { path: ROUTES.REGISTER_CLIENT, element: <AuthModalRedirect mode="register-client" /> },
      { path: ROUTES.REGISTER_PRO, element: <AuthModalRedirect mode="register-pro" /> },
      {
        path: ROUTES.DASHBOARD_CLIENT,
        element: <RoleRoute role={ROLES.CLIENT}><ClientDashboardPage /></RoleRoute>,
      },
      {
        path: ROUTES.DASHBOARD_PRO,
        element: <RoleRoute role={ROLES.PRO}><ProProfilePage /></RoleRoute>,
      },
      {
        path: ROUTES.ADMIN,
        element: <RoleRoute role={ROLES.ADMIN}><AdminDashboardPage /></RoleRoute>,
      },
      { path: '/forbidden', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
