// import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Outlet } from '@tanstack/react-router';
import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <Navbar />
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  );
}

export default App;
