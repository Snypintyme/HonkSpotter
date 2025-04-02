import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import apiClient from '@/api/apiClient';
import { useGooseSightingStore } from '@/store/useGooseSightingStore';
import router, { detailRoute } from '@/router';


const SightingDetail = () => {
  const { gooseSightings, selectedSighting, setSelectedSighting } = useGooseSightingStore();
  const [imageData, setImageData] = useState('');
  const [error, setError] = useState(null);
  const { sightingId } = detailRoute.useParams()
  const [initialLoad, setInitialLoad] = useState(true);

  // Find sighting, set the state, and fetch the image
  useEffect(() => {
    if (!initialLoad) return;

    const fetchImage = async () => {
      if (!selectedSighting?.image) {
        return;
      }

      setError(null);

      try {
        // Fetch the image directly - the response will be the image binary data
        const response = await apiClient.get(`/image/${selectedSighting.image}`, {
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

    if (!selectedSighting) {
      const sighting = gooseSightings.find((sighting) => sighting.id = sightingId);
      if (sighting) {
        setInitialLoad(false);
        setSelectedSighting(sighting);
      }
    }

    fetchImage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gooseSightings]);

  useEffect(() => {
    return () => {
      if (imageData) {
        URL.revokeObjectURL(imageData);
      }
    };
  }, [imageData]);

  if (!selectedSighting) return <p>Cannot find sighting</p>;

  let notif = undefined;

  if (error) {
    notif = <div className="error-message">Error displaying image</div>;
  }

  const onClickBack = () => {
    console.log('backing');
    setSelectedSighting(null);
    router.navigate({ to: '/',})
  }

  return (
    <div className="p-4">
      <Button variant="link" onClick={onClickBack} className="text-blue-500 px-0">
        &larr; Back
      </Button>
      <h3 className="text-xl font-bold mb-2">{selectedSighting.name}</h3>
      <p className="mb-2">{selectedSighting.notes}</p>
      <p className="text-sm text-gray-600">
        Coordinates: {selectedSighting.coords.lat}, {selectedSighting.coords.lng}
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
