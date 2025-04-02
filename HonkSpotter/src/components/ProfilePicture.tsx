import { useImage } from '@/hooks/useImage';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface ProfilePictureProps {
  profilePictureId: string | null;
  fallback: string | null;
  onClickAvatar?: () => void;
  className?: string;
}

const ProfilePicture = ({ profilePictureId, fallback, onClickAvatar, className }: ProfilePictureProps) => {
  const { image } = useImage(profilePictureId);

  return (
    <Avatar onClick={onClickAvatar} className={className}>
      <AvatarImage src={image} />
      <AvatarFallback>{fallback ?? 'A'}</AvatarFallback>
    </Avatar>
  );
};

export default ProfilePicture;
