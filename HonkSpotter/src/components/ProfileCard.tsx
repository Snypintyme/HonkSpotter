import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EditProfileDialog from '@/components/EditProfileDialog';
import { useImage } from '@/hooks/useImage';
import { User } from '@/interfaces/user';
import { useAuthStore } from '@/store/useAuthStore';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiEndpoints } from '@/enums/apiEndpoints';
import apiClient from '@/api/apiClient';
import { useSnackbar } from 'notistack';
import { isAxiosError } from 'axios';

interface ProfileCardProps {
  user: User;
}

const ProfileCard = ({ user }: ProfileCardProps) => {
  const { getUserId } = useAuthStore();
  const { image } = useImage(user.profile_picture);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: Partial<User>) => {
      const response = await apiClient.post(ApiEndpoints.UpdateProfile, updatedData);
      return response.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      setEditModalOpen(false);
    },
    onError: (err) => {
      enqueueSnackbar(
        isAxiosError(err) && err.response?.data?.error ? err.response.data.error : 'Failed to update profile',
        { variant: 'error' }
      );
    },
  });

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={image} />
            <AvatarFallback>{user.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800">{user.username || 'Anonymous User'}</h1>
            {user.is_banned && (
              <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded mt-2">Banned</span>
            )}
          </div>

          {getUserId() === user.id && (
            <Button variant="secondary" onClick={() => setEditModalOpen(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">About</h2>
          <p className="text-gray-600">{user.description || 'This user has not added a description yet.'}</p>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileDialog
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          initialData={{
            username: user.username || '',
            description: user.description || '',
            profile_picture: user.profile_picture || '',
          }}
          onSave={(data) => updateProfileMutation.mutate(data)}
          isSaving={updateProfileMutation.isPending}
        />
      )}
    </div>
  );
};

export default ProfileCard;

