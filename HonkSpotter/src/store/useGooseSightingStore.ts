import { create } from 'zustand';
import { GooseSighting } from '../interfaces/gooseSighting';

interface GooseSightingsState {
  gooseSightings: GooseSighting[];
  selectedSighting: GooseSighting | null;
  setGooseSightings: (sightings: GooseSighting[]) => void;
  addGooseSighting: (sighting: GooseSighting) => void;
  removeGooseSighting: (id: string) => void;
  setSelectedSighting: (sighting: GooseSighting | null) => void;
}

export const useGooseSightingStore = create<GooseSightingsState>()((set) => ({
  gooseSightings: [],
  selectedSighting: null,
  setGooseSightings: (sightings: GooseSighting[]) => set({ gooseSightings: sightings }),
  addGooseSighting: (sighting: GooseSighting) =>
    set((state: GooseSightingsState) => ({ gooseSightings: [...state.gooseSightings, sighting] })),
  removeGooseSighting: (id: string) =>
    set((state: GooseSightingsState) => ({
      gooseSightings: state.gooseSightings.filter((sighting) => sighting.id !== id),
    })),
  setSelectedSighting: (sighting: GooseSighting | null) => {
    set({ selectedSighting: sighting });
  },
}));
