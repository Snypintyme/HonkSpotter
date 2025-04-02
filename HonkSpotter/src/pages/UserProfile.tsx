import { useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/api/apiClient';
import { ApiEndpoints } from '@/enums/apiEndpoints';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/interfaces/user';
import { useSnackbar } from 'notistack';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import ProfileCard from '@/components/ProfileCard';

const UserProfile = () => {
  const { userId } = useParams({ strict: false });
  const { accessToken } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const {
    isPending,
    error,
    data: user,
  } = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await apiClient.get(`${ApiEndpoints.UserProfile}/${userId}`);
      return response.data.user;
    },
    enabled: !!accessToken,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retry: (failureCount, error: any) => {
      if (error.response?.status === 404) return false;
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (!accessToken) {
      enqueueSnackbar('You must be logged in to view user profiles', { variant: 'error' });
      navigate({ to: '/login' });
    }
  }, [userId, navigate, accessToken, enqueueSnackbar]);

  if (isPending) {
    return <div className="flex justify-center items-center h-screen w-screen">Loading...</div>;
  }

  if (isAxiosError(error) && error?.response?.status === 404) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-screen">
        <h2 className="text-xl text-red-500">User Not Found</h2>
        <p className="my-2">The user you're looking for doesn't exist or has been removed.</p>
        <Button variant="default" onClick={() => navigate({ to: '/' })}>
          Return to Home
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-screen">
        <h2 className="text-xl text-red-500">Error</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return <ProfileCard user={user} />;
};

export default UserProfile;
