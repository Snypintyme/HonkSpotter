import { Button } from './ui/button';
import { useEffect } from 'react';
import { useGooseSightingStore } from '@/store/useGooseSightingStore';
import router, { detailRoute } from '@/router';
import { useImage } from '@/hooks/useImage';
import { useNavigate } from '@tanstack/react-router';
import ProfilePicture from './ProfilePicture';
import { useCoordinatesStore } from '@/store/useCoordinatesStore';
import { toLocalTimestamp } from '@/lib/utils';

const SightingDetail = () => {
  const { gooseSightings, selectedSighting, setSelectedSighting } = useGooseSightingStore();
  const { setMapShouldPickCoords } = useCoordinatesStore();
  const { sightingId } = detailRoute.useParams();
  const { image, error } = useImage(selectedSighting?.image ?? null);
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedSighting(gooseSightings.find((sighting) => sighting.id === sightingId) ?? null);
  }, [gooseSightings, setSelectedSighting, sightingId]);

  // Change back to normal pins
  useEffect(() => {
    setMapShouldPickCoords(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selectedSighting) return <p>Cannot find sighting</p>;

  const onClickBack = () => {
    setSelectedSighting(null);
    router.navigate({ to: '/sightings' });
  };

  const onClickUserProfile = () => {
    navigate({ to: `/user/${selectedSighting.user.id}` });
  };

  return (
    <div className="container mx-auto px-6 py-4">
      <Button variant="link" onClick={onClickBack} className="text-blue-500 px-0 mb-4">
        &larr; Back to Sightings
      </Button>
      <h1 className="text-4xl font-bold mb-6 text-gray-800">{selectedSighting.name}</h1>
      {selectedSighting.user && (
        <div className="inline-flex items-center mb-6 w-fit cursor-pointer pr-2" onClick={onClickUserProfile}>
          <ProfilePicture
            profilePictureId={selectedSighting.user.profile_picture}
            fallback={selectedSighting.user.username?.charAt(0)?.toUpperCase() ?? null}
            className="w-10 h-10"
          />
          <div className="ml-4">{selectedSighting.user.username || 'Anonymous User'}</div>
        </div>
      )}
      <div className="mb-6">
        <p className="text-lg text-gray-700 mb-2">{selectedSighting.notes || 'No additional notes provided.'}</p>
        {image ? (
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Image:</h2>
            {error && <div className="error-message text-red-500">Error displaying image</div>}
            <img src={image} alt={selectedSighting.name} className="rounded-lg shadow-md" />
          </div>
        ) : (
          <p className="text-gray-600 mt-4">No image available for this sighting.</p>
        )}
      </div>
      <div className="mt- border-t pt-4">
        <p className="text-sm text-gray-600 mb-2">
          Coordinates: {selectedSighting.coords.lat}, {selectedSighting.coords.lng}
        </p>
        <p className="text-sm text-gray-600">Reported on: {toLocalTimestamp(selectedSighting.created_date)}</p>
      </div>
    </div>
  );
};

export default SightingDetail;
