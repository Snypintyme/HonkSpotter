import { create } from 'zustand';

interface Coordinates {
  lat: number,
  lng: number,
}

interface CoordinatesStore {
  coordinates: Coordinates | null,
  mapShouldPickCoords: boolean,
  setCoordinates: (coordinates: Coordinates | null) => void;
  setMapShouldPickCoords: (shouldPickCoords: boolean) => void;
}

export const useCoordinatesStore = create<CoordinatesStore>()((set) => ({
  coordinates: null,
  mapShouldPickCoords: false,
  setCoordinates: (coordinates: Coordinates | null) => set({ coordinates: coordinates }),
  setMapShouldPickCoords: (shouldPickCoords: boolean) => set({ mapShouldPickCoords: shouldPickCoords }),
}));
