import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import App from './App';
import Homepage from './pages/Homepage';
import Login from './pages/Login';

const rootRoute = createRootRoute({
  component: App,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Homepage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute]);

const router = createRouter({ routeTree });

export default router;
