import { useCallback, useEffect, useState } from 'react';
import Map from '@/components/Map';
import { useGooseSightingStore } from '@/store/useGooseSightingStore';
import SightingList from '@/components/SightingList';
import { GooseSighting } from '@/interfaces/gooseSighting';
import SightingDetail from '@/components/SightingDetail';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { ApiEndpoints } from '@/enums/apiEndpoints';
import ReportSighting from '@/components/SightingReport';
import ReportSightingButton from '@/components/buttons/ReportSightingButton';
import SelectMapLocationButton from '@/components/buttons/SelectMapLocationButton';

enum ActiveComponent {
  SightingList,
  SightingDetail,
  ReportSighting
}

const Homepage = () => {
  const { setGooseSightings: setGooseSightings } = useGooseSightingStore();
  const [selectedSighting, setSelectedSighting] = useState<GooseSighting | null>(null);
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>(ActiveComponent.SightingList);

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

  useEffect(() => {
    if (selectedSighting) {
      setActiveComponent(ActiveComponent.SightingDetail);
    }
  }, [selectedSighting]);

  const onCloseSightingDetail = useCallback(() => {
    setSelectedSighting(null);
    setActiveComponent(ActiveComponent.SightingList);
  }, [setSelectedSighting, setActiveComponent]);

  const onClickSelectedSighting = useCallback((sighting: GooseSighting) => {
    setSelectedSighting(sighting);
    setActiveComponent(ActiveComponent.SightingDetail);
  }, [setSelectedSighting, setActiveComponent]);

  const onClickReportSighting = useCallback(() => {
    setActiveComponent(ActiveComponent.ReportSighting);
  }, [setActiveComponent]);

  const renderComponent = () => {
    switch(activeComponent) {
      case ActiveComponent.SightingList:
        return <SightingList onClickSelectedSighting={onClickSelectedSighting} />;

      case ActiveComponent.SightingDetail:
        if (selectedSighting) {
          return <SightingDetail sighting={selectedSighting} onClose={onCloseSightingDetail} />;
        } else {
          return <SightingList onClickSelectedSighting={onClickSelectedSighting} />;
        }

      case ActiveComponent.ReportSighting:
        return <ReportSighting onClose={() => { 
          setActiveComponent(ActiveComponent.SightingList);
        }}/>;

      default:
        return undefined;
    }
  }

  return (
    <>
      <div className="flex-1 p-5 overflow-y-auto">
        { renderComponent() }
      </div>
      <div className="flex-1 flex">
        <Map selectedSighting={selectedSighting} setSelectedSighting={setSelectedSighting} />
      </div>
      { activeComponent !== ActiveComponent.ReportSighting ? (
        <ReportSightingButton
          onClick={onClickReportSighting}
        />
      ) : (
        <SelectMapLocationButton onClick={() => {}} />
      )}
    </>
  );
};

export default Homepage;
