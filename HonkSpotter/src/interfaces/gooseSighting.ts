import { Coordinate } from './coordinate';

export interface GooseSighting {
  id: string;
  name: string;
  notes?: string;
  coords: Coordinate;
  image?: string;
  user: string;
  created_date: Date;
}
