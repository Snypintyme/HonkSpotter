import { Coordinate } from './coordinate';

// TODO: Add user who reported it
export interface GooseSighting {
  id: string;
  title: string;
  description: string;
  coordinate: Coordinate;
  image?: string;
}
