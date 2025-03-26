import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import App from './App';
import Homepage from './pages/Homepage';
import Authentication from './pages/authentication';
import { AuthType } from './enums/authType';

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
  component: () => <Authentication authType={AuthType.Login} />,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: () => <Authentication authType={AuthType.Signup} />,
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, signupRoute]);

const router = createRouter({ routeTree });

export default router;
