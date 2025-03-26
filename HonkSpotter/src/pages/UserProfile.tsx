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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          <Avatar>
            <AvatarImage src={user.profile_picture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">{user.username || 'Anonymous User'}</h1>
            {user.is_banned && (
              <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">Banned</span>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <p className="text-gray-700">{user.description || 'This user has not added a description yet.'}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

