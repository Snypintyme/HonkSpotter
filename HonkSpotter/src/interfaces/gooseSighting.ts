import { Coordinate } from './coordinate';
import { User } from './user';

export interface GooseSighting {
  id: string;
  name: string;
  notes: string | null;
  coords: Coordinate;
  image: string | null;
  user: User;
  created_date: Date;
}
