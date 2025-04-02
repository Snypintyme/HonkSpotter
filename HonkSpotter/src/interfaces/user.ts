export interface User {
  id: string;
  username: string;
  description: string;
  profile_picture: string | null;
  is_banned: boolean;
}
