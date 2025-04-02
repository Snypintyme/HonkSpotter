import { useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useGooseSightingStore } from '@/store/useGooseSightingStore';
import { LatLngExpression, Icon } from 'leaflet';
import router from '@/router';

const DEFAULT_CENTER: LatLngExpression = [43.4643, -80.5204]; // Default to Waterloo
const DEFAULT_ZOOM = 11;
const DEFAULT_SELECTED_ZOOM = 15;

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  popupAnchor: [0, -41],
});

const selectedIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  popupAnchor: [0, -41],
});

const ChangeView = ({ center, zoom }: { center: LatLngExpression; zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const Map = () => {
  const { gooseSightings, selectedSighting, setSelectedSighting } = useGooseSightingStore();
  const [initialMapLoaded, setInitialMapLoaded] = useState<boolean>(false);

  // When goose sightings are loaded, update the default map center and zoom
  const [defaultSightingCenter, defaultSightingZoom] = useMemo(() => {
    if (initialMapLoaded === false && gooseSightings.length > 0) {
      // TODO: This only looks nice with the sample data, figure out a better way to default to a center
      const lat = gooseSightings.reduce((acc, sighting) => acc + sighting.coords.lat, 0) / gooseSightings.length;
      const lng = gooseSightings.reduce((acc, sighting) => acc + sighting.coords.lng, 0) / gooseSightings.length;
      const newCenter: LatLngExpression = [lat, lng];
      // NOTE: Hack required to get this to actually work for rerender reasons
      setTimeout(() => setInitialMapLoaded(true), 100);
      return [newCenter, DEFAULT_ZOOM];
    }
    return [null, null];
  }, [gooseSightings, initialMapLoaded]);

  // When a valid sighting is selected, snap to selected sighting
  const [selectedSightingCenter, selectedSightingZoom] = useMemo(() => {
    if (selectedSighting) {
      router.navigate({ to: `/detail/${selectedSighting.id}`})
      const newCenter: LatLngExpression = [selectedSighting.coords.lat, selectedSighting.coords.lng];
      return [newCenter, DEFAULT_SELECTED_ZOOM];
    }
    return [null, null];
  }, [selectedSighting]);

  const activeCenter = defaultSightingCenter ?? selectedSightingCenter;
  const activeZoom = defaultSightingZoom ?? selectedSightingZoom;

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM}>
      {activeCenter && <ChangeView center={activeCenter} zoom={activeZoom ?? DEFAULT_ZOOM} />}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {gooseSightings.map((sighting) => (
        <Marker
          key={sighting.id}
          position={[sighting.coords.lat, sighting.coords.lng]}
          icon={sighting.id === selectedSighting?.id ? selectedIcon : defaultIcon}
          eventHandlers={{
            click: () => {
              setSelectedSighting(sighting);
            },
            mouseover: (e) => {
              e.target.openPopup();
            },
            mouseout: (e) => {
              e.target.closePopup();
            },
          }}
        >
          <Popup closeButton={false}>{sighting.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
