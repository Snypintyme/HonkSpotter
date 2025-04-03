import { navigateToSightingDetail } from '@/lib/utils';
import { useCoordinatesStore } from '@/store/useCoordinatesStore';
import { useGooseSightingStore } from '@/store/useGooseSightingStore';
import { useEffect } from 'react';

const SightingList = () => {
  const { gooseSightings } = useGooseSightingStore();
  const { setMapShouldPickCoords } = useCoordinatesStore();

  // Change back to normal pins
  useEffect(() => {
    setMapShouldPickCoords(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">{`${gooseSightings.length} Reported Sightings`}</h2>
      <ul>
        {gooseSightings.map((sighting, index) => (
          <li
            key={index}
            className="mt-4 mb-4 border-b border-gray-300 pb-2 pl-2 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out"
            onClick={() => {
              navigateToSightingDetail(sighting.id);
            }}
          >
            <h3 className="text-xl font-semibold">{sighting.name}</h3>
            <p>{sighting.notes}</p>
            <p className="text-sm text-gray-600">
              Coordinates: {sighting.coords.lat}, {sighting.coords.lng}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
};

export default SightingList;
