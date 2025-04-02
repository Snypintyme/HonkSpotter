import { Link, useNavigate } from '@tanstack/react-router';
import logo from '@/assets/goose.png';
import { Button } from './ui/button';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useRef, useState } from 'react';
import apiClient from '@/api/apiClient';
import { ApiEndpoints } from '@/enums/apiEndpoints';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useImage } from '@/hooks/useImage';

const Navbar = () => {
  const { accessToken, clearAccessToken, getUserId, getProfilePictureId } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { image } = useImage(getProfilePictureId());

  // Call a temporary GET /api/test endpoint
  const handleTestApi = async () => {
    try {
      const response = await apiClient.get('/test', { withCredentials: true });
      const msg = `Test API success: ${JSON.stringify(response.data)}`;
      enqueueSnackbar(msg, { variant: 'success' });
      console.log(msg);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const msg = `Test API error: ${error.message}`;
      enqueueSnackbar(`Test API error: ${error.message}`, { variant: 'error' });
      console.log(msg);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await apiClient.post(ApiEndpoints.Logout, {}, { withCredentials: true });
      if (response.status === 200) {
        clearAccessToken();
        setDropdownOpen(false);
        enqueueSnackbar('Logged out', { variant: 'success' });
        navigate({ to: '/login' });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        enqueueSnackbar(`Error logging out: ${error.message}`, { variant: 'error' });
      } else {
        throw new Error(`Unexpected Throw: ${typeof error}`);
      }
    }
  };

  const handleNavigateToProfile = () => {
    const userId = getUserId();
    if (userId) {
      navigate({ to: `/user/${userId}` });
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 border-b border-gray-200">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            <div className="flex-shrink-0">
              <span className="flex flex-row text-xl font-semibold text-gray-800">
                <img src={logo} alt="Your Logo" className="h-8 w-auto mr-2" />
                HonkSpotter
              </span>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="default" onClick={handleTestApi}>
              Test API
            </Button>
            {accessToken ? (
              <div className="relative" ref={dropdownRef}>
                <Avatar onClick={() => setDropdownOpen((prev) => !prev)}>
                  <AvatarImage src={image} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg z-1000">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleNavigateToProfile}
                    >
                      Profile
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="default">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
