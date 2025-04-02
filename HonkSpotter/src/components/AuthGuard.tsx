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
  console.log('checking auth guard', accessToken);

  useEffect(() => {
    const doRefresh = async () => {
      await refreshAccessToken();
      setTriedRefresh(true);
    };
    if (!useAuthStore.getState().accessToken) {
      console.log('refreshing access token');
      doRefresh();
    }
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

