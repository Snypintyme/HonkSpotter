import { GooseSighting } from '@/interfaces/gooseSighting';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import apiClient from '@/api/apiClient';

interface SightingDetailProps {
  sighting: GooseSighting;
  onClose: () => void;
}

const SightingDetail = ({ sighting, onClose }: SightingDetailProps) => {
  const [imageData, setImageData] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!sighting.image) {
        return;
      }

      setError(null);

      try {
        // Fetch the image directly - the response will be the image binary data
        const response = await apiClient.get(`/image/${sighting.image}`, {
          responseType: 'blob', // Important: This tells axios to expect binary data
          withCredentials: true
        });

        // Create a URL for the blob data
        const imageObjectUrl = URL.createObjectURL(response.data);
        setImageData(imageObjectUrl);
      } catch (err: unknown) {
        console.error('Error fetching image:', err);
      }
    };

    fetchImage();
  }, [sighting]);

  useEffect(() => {
    return () => {
      if (imageData) {
        URL.revokeObjectURL(imageData);
      }
    };
  }, [imageData]);

  let notif = undefined;

  if (error) {
    notif = <div className="error-message">Error displaying image</div>;
  }

  return (
    <div className="p-4">
      <Button variant="link" onClick={onClose} className="text-blue-500 px-0">
        &larr; Back
      </Button>
      <h3 className="text-xl font-bold mb-2">{sighting.name}</h3>
      <p className="mb-2">{sighting.notes}</p>
      <p className="text-sm text-gray-600">
        Coordinates: {sighting.coords.lat}, {sighting.coords.lng}
      </p>
      {imageData ? (
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            Image:
          </p>
          {notif}
          <img 
            src={imageData} 
            className="mt-1"
          />
        </div>
      ) : 
        undefined
      }

    </div>
  );
};

export default SightingDetail;
