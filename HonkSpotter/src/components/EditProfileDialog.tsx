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
            />
          </div>

          {/* Profile Picture Upload */}
          <div>
            <ImageUpload
              onImageChange={
                (image) => handleInputChange('profile_picture', image) // Update profile picture in form data
              }
            />
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
