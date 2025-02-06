// import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Outlet } from '@tanstack/react-router';

function App() {
  return (
    <>
      <div className="bg-red-500 text-blue-500 p-5">
        If this text is white on a red background with padding, Tailwind is working!
      </div>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  );
}

export default App;
