import { Button } from './ui/button';
import { useEffect } from 'react';
import { useGooseSightingStore } from '@/store/useGooseSightingStore';
import router, { detailRoute } from '@/router';
import { useImage } from '@/hooks/useImage';

const SightingDetail = () => {
  const { gooseSightings, selectedSighting, setSelectedSighting } = useGooseSightingStore();
  const { sightingId } = detailRoute.useParams();
  const { image, error } = useImage(selectedSighting?.image ?? null);

  useEffect(() => {
    setSelectedSighting(gooseSightings.find((sighting) => sighting.id === sightingId) ?? null);
  }, [gooseSightings, setSelectedSighting, sightingId]);

  if (!selectedSighting) return <p>Cannot find sighting</p>;

  let notif = undefined;

  if (error) {
    notif = <div className="error-message">Error displaying image</div>;
  }

  const onClickBack = () => {
    setSelectedSighting(null);
    router.navigate({ to: '/sightings' });
  };

  return (
    <div className="p-4">
      <Button variant="link" onClick={onClickBack} className="text-blue-500 px-0">
        &larr; Home
      </Button>
      <h3 className="text-xl font-bold mb-2">{selectedSighting.name}</h3>
      <p className="mb-2">{selectedSighting.notes}</p>
      <p className="text-sm text-gray-600">
        Coordinates: {selectedSighting.coords.lat}, {selectedSighting.coords.lng}
      </p>
      {image ? (
        <div className="mt-2">
          <p className="text-sm text-gray-600">Image:</p>
          {notif}
          <img src={image} className="mt-1" />
        </div>
      ) : undefined}
    </div>
  );
};

export default SightingDetail;
