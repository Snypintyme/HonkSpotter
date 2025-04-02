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
    isPending: isUserPending,
    error: userError,
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

  const {
    isPending: isSightingsPending,
    error: sightingsError,
    data: sightings,
  } = useQuery({
    queryKey: ['sightings', userId],
    queryFn: async () => {
      const response = await apiClient.get(`${ApiEndpoints.GetSightings}?user_id=${userId}`);
      return response.data.sightings;
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

  if (isUserPending || isSightingsPending) {
    return <div className="flex justify-center items-center h-screen w-screen">Loading...</div>;
  }

  if (isAxiosError(userError) && userError?.response?.status === 404) {
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

  if (userError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-screen">
        <h2 className="text-xl text-red-500">Error Loading User Info</h2>
        <p>{userError.message}</p>
      </div>
    );
  }

  if (sightingsError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-screen">
        <h2 className="text-xl text-red-500">Error Loading User Sightings</h2>
        <p>{sightingsError.message}</p>
      </div>
    );
  }

  return <ProfileCard user={user} sightings={sightings} />;
};

export default UserProfile;
