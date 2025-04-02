import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import router from '@/router';
import { useGooseSightingStore } from '@/store/useGooseSightingStore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const navigateToSightingDetail = (sightingId: string) => {
  const sighting = useGooseSightingStore.getState().gooseSightings.find((sighting) => sighting.id === sightingId);
  useGooseSightingStore.getState().setSelectedSighting(sighting ?? null);
  router.navigate({ to: `/detail/${sightingId}` });
};
