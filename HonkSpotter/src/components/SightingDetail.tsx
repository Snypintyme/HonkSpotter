import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { useGooseSightingStore } from '@/store/useGooseSightingStore';
import router, { detailRoute } from '@/router';
import { useImage } from '@/hooks/useImage';


const SightingDetail = () => {
  const { gooseSightings, selectedSighting, setSelectedSighting } = useGooseSightingStore();
  const { sightingId } = detailRoute.useParams()
  const [initialLoad, setInitialLoad] = useState(true);
  const { image, error } = useImage(selectedSighting?.image);

  // Find sighting, set the state, and fetch the image
  useEffect(() => {
    if (!selectedSighting && initialLoad) {
      const sighting = gooseSightings.find((sighting) => sighting.id = sightingId);
      if (sighting) {
        setInitialLoad(false);
        setSelectedSighting(sighting);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gooseSightings]);

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
