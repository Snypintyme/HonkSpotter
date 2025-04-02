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

  const onClickReportSighting = useCallback(() => {
    router.navigate({ to: '/report'})
  }, []);

  const showButton = () => {
    const pathname = location.pathname;
    if (pathname === '/sightings') {
      return (
        <ReportSightingButton
          onClick={onClickReportSighting}
        />
      );
    } else if (pathname === '/report') {
      return <SelectMapLocationButton onClick={() => {}} />
    }
  }

  return (
    <>
      <div className="flex-1 p-5 overflow-y-auto">
        <Outlet/>
      </div>
      <div className="flex-1 flex">
        <Map/>
      </div>
      {showButton()}
     </>
  );
};

export default Homepage;
