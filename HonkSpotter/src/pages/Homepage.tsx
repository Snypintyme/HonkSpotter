import { useCallback, useEffect, useState } from 'react';
import Map from '@/components/Map';
import { useGooseSightingStore } from '@/store/useGooseSightingStore';
import SightingList from '@/components/SightingList';
import { GooseSighting } from '@/interfaces/gooseSighting';
import SightingDetail from '@/components/SightingDetail';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { ApiEndpoints } from '@/enums/apiEndpoints';

const Homepage = () => {
  const { setGooseSightings: setGooseSightings } = useGooseSightingStore();
  const [selectedSighting, setSelectedSighting] = useState<GooseSighting | null>(null);

  const { data: gooseSightings } = useQuery<GooseSighting[]>({
    queryKey: ['sightings'],
    queryFn: async () => {
      const response = await apiClient.get(ApiEndpoints.GetSightings);
      return response.data.sightings;
    },
  });

  useEffect(() => {
    setGooseSightings(gooseSightings ?? []);
  }, [gooseSightings, setGooseSightings]);

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
