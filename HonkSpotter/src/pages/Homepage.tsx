import { useCallback, useEffect, useState } from 'react';
import Map from '@/components/map';
import { mockGooseSightings } from '@/utils/sampleData';
import { useGooseSightingStore } from '@/store/useGooseSightingStore';
import SightingList from '@/components/sightingList';
import { GooseSighting } from '@/interfaces/gooseSighting';
import SightingDetail from '@/components/sightingDetail';

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
    <>
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
    </>
  );
};

export default Homepage;
