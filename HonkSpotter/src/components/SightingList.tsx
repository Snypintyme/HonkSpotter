import { GooseSighting } from '@/interfaces/gooseSighting';
import { useGooseSightingStore } from '@/store/useGooseSightingStore';

interface SightingListProps {
  setSelectedSighting: (sighting: GooseSighting) => void;
}

const SightingList = ({ setSelectedSighting }: SightingListProps) => {
  const { gooseSightings } = useGooseSightingStore();

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Goose Sightings</h2>
      <ul>
        {gooseSightings.map((sighting, index) => (
          <li
            key={index}
            className="mt-4 mb-4 border-b border-gray-300 pb-2 pl-2 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out"
            onClick={() => setSelectedSighting(sighting)}
          >
            <h3 className="text-xl font-semibold">{sighting.title}</h3>
            <p>{sighting.description}</p>
            <p className="text-sm text-gray-600">
              Coordinates: {sighting.coordinate.lat}, {sighting.coordinate.lng}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
};

export default SightingList;
