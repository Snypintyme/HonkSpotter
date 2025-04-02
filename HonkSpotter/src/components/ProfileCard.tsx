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
import { GooseSighting } from '@/interfaces/gooseSighting';
import { navigateToSightingDetail } from '@/lib/utils';

interface ProfileCardProps {
  user: User;
  sightings: GooseSighting[];
}

const ProfileCard = ({ user, sightings }: ProfileCardProps) => {
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
        {/* Profile Header */}
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

          {/* Edit Profile Button */}
          {getUserId() === user.id && (
            <Button variant="secondary" onClick={() => setEditModalOpen(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        {/* About Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">About</h2>
          <p className="text-gray-600">{user.description || 'This user has not added a description yet.'}</p>
        </div>

        {/* Sightings Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Sightings</h2>
          {!sightings.length ? (
            <p className="text-gray-600">This user has not reported any sightings yet.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto border rounded-lg shadow-inner p-4 bg-gray-50">
              <ul className="space-y-4">
                {sightings.map((sighting) => (
                  <li
                    key={sighting.id}
                    className="border p-4 rounded-lg shadow-sm bg-white hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => navigateToSightingDetail(sighting.id)}
                  >
                    <h3 className="font-bold text-lg">{sighting.name}</h3>
                    <p>{sighting.notes || 'No additional notes provided.'}</p>
                    <span className="text-sm text-gray-500">
                      Reported on {new Date(sighting.created_date).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
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
