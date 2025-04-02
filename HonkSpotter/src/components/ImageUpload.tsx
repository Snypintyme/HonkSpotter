import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Input } from './ui/input';
import apiClient from '@/api/apiClient';
import { ApiEndpoints } from '@/enums/apiEndpoints';

interface ImageUploadProps {
  onImageChange: (image: string) => void;
}

const ImageUpload = ({ onImageChange }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>('');
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);

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
    },
    onError: (error) => {
      console.error('Failed to delete image', error);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    uploadImageMutation.mutate(file);
  };

  const handleDeleteImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!currentImageId) return;

    deleteImageMutation.mutate(currentImageId);
  };

  return (
    <div>
      <Input name="image" type="file" accept="image/*" onChange={handleImageChange} />
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Preview" style={{ width: '200px', height: 'auto' }} />
          <button className="cursor-pointer underline text-red-500 mt-2" onClick={handleDeleteImage}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
