import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import useGooseLocationStore from '../store/useGooseLocationStore';
import { LatLngExpression } from 'leaflet';

const ChangeView = ({ center, zoom }: { center: LatLngExpression; zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const Map = () => {
  const { gooseLocations } = useGooseLocationStore();

  const mapCenter: LatLngExpression = useMemo(() => {
    console.log(gooseLocations);
    // TODO: Figure out a better way to default to a center + need to load the data first
    const lat = gooseLocations.reduce((acc, location) => acc + location.coordinate.lat, 0) / gooseLocations.length;
    const lng = gooseLocations.reduce((acc, location) => acc + location.coordinate.lng, 0) / gooseLocations.length;
    return gooseLocations.length > 0 ? [lat, lng] : [43.4643, -80.5204];
  }, [gooseLocations]);

  const mapZoom: number = useMemo(() => {
    return 10;
  }, []);

  return (
    <MapContainer center={[43.4643, -80.5204]} zoom={10}>
      <ChangeView center={mapCenter} zoom={mapZoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {gooseLocations.map((location) => (
        <Marker key={location.id} position={[location.coordinate.lat, location.coordinate.lng]}>
          <Popup>{location.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
