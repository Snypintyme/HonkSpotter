import { GooseSighting } from '@/interfaces/gooseSighting';
import { Button } from './ui/button';

interface SightingDetailProps {
  sighting: GooseSighting;
  onClose: () => void;
}

const SightingDetail = ({ sighting, onClose }: SightingDetailProps) => {
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
    </div>
  );
};

export default SightingDetail;
