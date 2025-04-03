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

export const toLocalDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    timeZone: 'America/New_York',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const toLocalTimestamp = (date: Date) => {
  return new Date(date).toLocaleString('en-GB', {
    timeZone: 'America/New_York',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};
