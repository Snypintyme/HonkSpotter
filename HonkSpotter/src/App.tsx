// import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Outlet } from '@tanstack/react-router';
import Navbar from './components/navbar';

function App() {
  return (
    <>
      <Navbar />
      {/* NOTE: h-[calc(100vh-64px)] - 64px is the height of the navbar */}
      <div className="flex h-[calc(100vh-64px)]">
        <Outlet />
      </div>
      {/* <TanStackRouterDevtools /> */}
    </>
  );
}

export default App;
