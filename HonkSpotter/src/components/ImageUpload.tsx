import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from './ui/input';
import apiClient from '@/api/apiClient';
import { ApiEndpoints } from '@/enums/apiEndpoints';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { useSnackbar } from 'notistack';

interface ImageUploadProps {
  onImageChange: (image: string) => void;
}

const ImageUpload = ({ onImageChange }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>('');
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post(ApiEndpoints.ImageUpload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      return response.data.id;
    },
    onSuccess: async (imageId) => {
      if (currentImageId) {
        await apiClient.delete(`/image-delete/${currentImageId}`, { withCredentials: true });
      }

      setCurrentImageId(imageId);
      onImageChange(imageId);
    },
    onError: (error) => {
      console.error('Image upload failed', error);
      enqueueSnackbar("Image upload failed", { 
        variant: 'error',
        autoHideDuration: 10000
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      await apiClient.delete(`/image-delete/${imageId}`, { withCredentials: true });
    },
    onSuccess: () => {
      setCurrentImageId(null);
      setPreview('');
      onImageChange('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      console.error('Failed to delete image', error);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('Image size exceeds 5MB. Please upload a smaller file.', {
        variant: 'error',
        autoHideDuration: 1000,
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      console.error('Selected file is not an image');
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    if (objectUrl.startsWith('blob:')) {
      setPreview(objectUrl);
      uploadImageMutation.mutate(file);
    } else {
      console.error('Invalid preview URL');
    }

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  };

  const handleDeleteImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!currentImageId) return;

    deleteImageMutation.mutate(currentImageId);
  };

  return (
    <div>
      <Label htmlFor="image">Image</Label>
      <Input
        id="image"
        name="image"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        className="cursor-pointer"
      />
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Preview" className="w-48 h-auto rounded-md border border-gray-300" />
          <Button variant="link" onClick={handleDeleteImage} className="text-red-500 mt-1">
            Delete Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
