import { Coordinate } from './coordinate';

export interface GooseLocation {
  id: string;
  title: string;
  description: string;
  coordinate: Coordinate;
  image?: string;
}
