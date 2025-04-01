import { GooseSighting } from '@/interfaces/gooseSighting';
import { Button } from './ui/button';
import { useImage } from '@/hooks/useImage';

interface SightingDetailProps {
  sighting: GooseSighting;
  onClose: () => void;
}

const SightingDetail = ({ sighting, onClose }: SightingDetailProps) => {
  const { image, error } = useImage(sighting.image);

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
