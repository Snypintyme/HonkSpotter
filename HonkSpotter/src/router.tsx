import { createRootRoute, createRoute, createRouter, Link } from '@tanstack/react-router';
import App from './App';
import Homepage from './pages/Homepage';
import Authentication from './pages/Authentication';
import { AuthType } from './enums/authType';
import SightingReport from './components/SightingReport';
import SightingDetail from './components/SightingDetail';
import SightingList from './components/SightingList';
import UserProfile from './pages/UserProfile';
import AuthGuard from './components/AuthGuard';

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


const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user/$userId',
  component: () => (
    <AuthGuard>
      <UserProfile />
    </AuthGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  listRoute,
  detailRoute,
  reportRoute,
  loginRoute,
  signupRoute,
  userProfileRoute
]);

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => {
    return (
      <div className="min-h-screen min-w-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">Page not found</h2>
          <p className="mt-4 text-lg text-gray-500">Sorry, we couldn't find the page you're looking for.</p>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Return to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  },
});

export default router;
