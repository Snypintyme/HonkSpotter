import { GooseSighting } from '../interfaces/gooseSighting';

interface SightingDetailProps {
  sighting: GooseSighting;
  onClose: () => void;
}

const SightingDetail = ({ sighting, onClose }: SightingDetailProps) => {
  return (
    <div className="p-4">
      <button onClick={onClose} className="mb-4 text-blue-500 hover:underline cursor-pointer">
        &larr; Back
      </button>
      <h3 className="text-xl font-bold mb-2">{sighting.title}</h3>
      <p className="mb-2">{sighting.description}</p>
      <p className="text-sm text-gray-600">
        Coordinates: {sighting.coordinate.lat}, {sighting.coordinate.lng}
      </p>
    </div>
  );
};

export default SightingDetail;

