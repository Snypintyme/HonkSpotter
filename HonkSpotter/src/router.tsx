import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import App from './App';
import Homepage from './pages/Homepage';
import Authentication from './pages/authentication';
import { AuthType } from './enums/authType';
import SightingReport from './components/SightingReport';
import SightingDetail from './components/SightingDetail';
import SightingList from './components/SightingList';

const rootRoute = createRootRoute({
  component: App,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Homepage,
});

const listRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/sightings',
  component: SightingList,
});

export const detailRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/detail/$sightingId', // Correct syntax for dynamic params
  component: SightingDetail,
});

const reportRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: '/report',
  component: SightingReport,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => <Authentication authType={AuthType.Login} />,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: () => <Authentication authType={AuthType.Signup} />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  listRoute,
  detailRoute,
  reportRoute,
  loginRoute,
  signupRoute
]);

const router = createRouter({ routeTree });

export default router;
