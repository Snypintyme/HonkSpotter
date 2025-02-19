import { useCallback, useEffect, useState } from 'react';
import Map from '../components/Map';
import { mockGooseSightings } from '../utils/sampleData';
import useGooseSightingStore from '../store/useGooseSightingStore';
import SightingList from '../components/SightingList';
import { GooseSighting } from '../interfaces/gooseSighting';
import SightingDetail from '../components/SightingDetail';

const Homepage = () => {
  const { setGooseSightings: setGooseSightings } = useGooseSightingStore();
  const [selectedSighting, setSelectedSighting] = useState<GooseSighting | null>(null);

  // TODO: fetch data from API
  useEffect(() => {
    setGooseSightings(mockGooseSightings);
  }, [setGooseSightings]);

  const onCloseSightingDetail = useCallback(() => {
    setSelectedSighting(null);
  }, [setSelectedSighting]);

  return (
    // NOTE: h-[calc(100vh-64px)] - 64px is the height of the navbar
    <div className="flex h-[calc(100vh-64px)]">
      <div className="flex-1 p-5 overflow-y-auto">
        {selectedSighting ? (
          <SightingDetail sighting={selectedSighting} onClose={onCloseSightingDetail} />
        ) : (
          <SightingList setSelectedSighting={setSelectedSighting} />
        )}
      </div>
      <div className="flex-1 flex">
        <Map selectedSighting={selectedSighting} setSelectedSighting={setSelectedSighting} />
      </div>
    </div>
  );
};

export default Homepage;
