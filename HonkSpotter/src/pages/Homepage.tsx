import { useEffect } from 'react';
import Map from '../components/Map';
import { gooseLocations as gooseLocationMockData } from '../utils/sampleData';
import useGooseLocationStore from '../store/useGooseLocationStore';
import ListView from '../components/ListView';

const Homepage = () => {
  const { setGooseLocations } = useGooseLocationStore();

  // TODO: fetch data from API
  useEffect(() => {
    setGooseLocations(gooseLocationMockData);
  }, [setGooseLocations]);

  return (
    // h-[calc(100vh-64px)] - 64px is the height of the navbar
    <div className="flex h-[calc(100vh-64px)]">
      <div className="flex-1 p-5 overflow-y-auto">
        <ListView />
      </div>
      <div className="flex-1 flex">
        <Map />
      </div>
    </div>
  );
};

export default Homepage;
