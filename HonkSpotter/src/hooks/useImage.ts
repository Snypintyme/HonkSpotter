import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import apiClient from '@/api/apiClient';

const fetchImage = async (imageId: string): Promise<string> => {
  const response = await apiClient.get(`/image/${imageId}`, {
    responseType: 'blob',
    withCredentials: true,
  });

  return URL.createObjectURL(response.data);
};

export const useImage = (imageId: string | undefined) => {
  const {
    data: image,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['image', imageId],
    queryFn: () => fetchImage(imageId!),
    enabled: !!imageId,
    staleTime: Infinity,
  });

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  return { image, error, isLoading };
};

