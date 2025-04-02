import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUpload from '@/components/ImageUpload';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    username: string;
    description: string;
    profile_picture: string;
  };
  onSave: (data: { username: string; description: string; profile_picture: string }) => void;
  isSaving?: boolean;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState(initialData);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information below. Click "Save Changes" when you're done.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4 flex flex-col"
        >
          {/* Username Input */}
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              required
            />
          </div>

          {/* Description Textarea */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              name="description"
              placeholder="Write a short description about yourself..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </div>

          {/* Profile Picture Upload */}
          <div>
            <Label htmlFor="profile_picture">Profile Picture</Label>
            <ImageUpload
              onImageChange={
                (image) => handleInputChange('profile_picture', image) // Update profile picture in form data
              }
            />
            {formData.profile_picture && (
              <div className="mt-4">
                <img
                  src={formData.profile_picture}
                  alt="Profile Preview"
                  className="w-32 h-auto rounded-md border border-gray-300"
                />
                {/* Optionally remove this section if ImageUpload handles deletion */}
                <button
                  type="button"
                  className="text-red-500 underline mt-2"
                  onClick={() => handleInputChange('profile_picture', '')}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <Button type="submit" className="w-fit bg-blue-500 hover:bg-blue-600" disabled={isSaving}>
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
