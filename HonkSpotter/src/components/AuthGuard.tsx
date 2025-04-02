import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useSnackbar } from 'notistack';
import { refreshAccessToken } from '@/api/apiClient';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { accessToken } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [triedRefresh, setTriedRefresh] = useState(false);

  useEffect(() => {
    const doRefresh = async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Failed to refresh token:', error);
      } finally {
        setTriedRefresh(true);
      }
    };
    console.log('accessToken', accessToken);
    if (!accessToken) {
      doRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!accessToken && triedRefresh) {
      enqueueSnackbar('You must be logged in to access this page', { variant: 'error' });
      navigate({ to: '/login' });
    }
  }, [accessToken, navigate, enqueueSnackbar, triedRefresh]);

  if (!accessToken) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
