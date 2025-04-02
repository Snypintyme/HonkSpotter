import { useCallback, useEffect } from 'react';
import Map from '@/components/Map';
import { useGooseSightingStore } from '@/store/useGooseSightingStore';
import { GooseSighting } from '@/interfaces/gooseSighting';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { ApiEndpoints } from '@/enums/apiEndpoints';
import ReportSightingButton from '@/components/buttons/ReportSightingButton';
import SelectMapLocationButton from '@/components/buttons/SelectMapLocationButton';
import router from '@/router';
import { Outlet, useLocation } from '@tanstack/react-router';

// enum ActiveComponent {
//   SightingList,
//   SightingDetail,
//   ReportSighting
// }

const Homepage = () => {
  const { selectedSighting, setGooseSightings } = useGooseSightingStore();
  // const [selectedSighting, setSelectedSighting] = useState<GooseSighting | null>(null);
  // const [activeComponent, setActiveComponent] = useState<ActiveComponent>(ActiveComponent.SightingList);
  const location = useLocation();
  console.log(location);
  console.log(selectedSighting);

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
    if (location.pathname === '/') router.navigate({ to: '/sightings' })
  }, [location.pathname]);

  // useEffect(() => {
  //   if (selectedSighting) {
  //     // setActiveComponent(ActiveComponent.SightingDetail);
  //     router.navigate({ to: `/detail/${selectedSighting.id}`})
  //   }
  // }, [selectedSighting]);

  // const onCloseSightingDetail = useCallback(() => {
  //   setSelectedSighting(null);
  //   setActiveComponent(ActiveComponent.SightingList);
  // }, [setSelectedSighting, setActiveComponent]);

  // const onClickSelectedSighting = useCallback((sighting: GooseSighting) => {
  //   // setSelectedSighting(sighting);
  //   // setActiveComponent(ActiveComponent.SightingDetail);

  // }, []);

  const onClickReportSighting = useCallback(() => {
    // setActiveComponent(ActiveComponent.ReportSighting);
    router.navigate({ to: '/report'})
  }, []);

  // const renderComponent = () => {
  //   switch(activeComponent) {
  //     case ActiveComponent.SightingList:
  //       return <SightingList onClickSelectedSighting={onClickSelectedSighting} />;

  //     case ActiveComponent.SightingDetail:
  //       if (selectedSighting) {
  //         return <SightingDetail sighting={selectedSighting} onClose={onCloseSightingDetail} />;
  //       } else {
  //         return <SightingList onClickSelectedSighting={onClickSelectedSighting} />;
  //       }

  //     case ActiveComponent.ReportSighting:
  //       return <ReportSighting onClose={() => { 
  //         setActiveComponent(ActiveComponent.SightingList);
  //       }}/>;

  //     default:
  //       return undefined;
  //   }
  // }

  return (
    <>
      <div className="flex-1 p-5 overflow-y-auto">
        <Outlet/>
      </div>
      <div className="flex-1 flex">
        <Map/>
      </div>
      { location.href == '/report' ? (
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
