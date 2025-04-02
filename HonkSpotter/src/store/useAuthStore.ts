import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  identity: string;
  user_id: string;
  username: string;
  profile_picture: string;
}

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAccessToken: () => void;
  getUserId: () => string | null;
  getUsernameFallback: () => string | null;
  getProfilePictureId: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  setAccessToken: (token: string | null) => set({ accessToken: token }),
  clearAccessToken: () => set({ accessToken: null }),
  getUserId: () => {
    const accessToken = get().accessToken;
    if (!accessToken) return null;

    try {
      const decodedToken = jwtDecode<DecodedToken>(accessToken);
      return decodedToken.user_id || null;
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  },
  getUsernameFallback: () => {
    const accessToken = get().accessToken;
    if (!accessToken) return null;

    try {
      const decodedToken = jwtDecode<DecodedToken>(accessToken);
      return decodedToken.username?.charAt(0)?.toUpperCase() || null;
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  },
  getProfilePictureId: () => {
    const accessToken = get().accessToken;
    if (!accessToken) return null;

    try {
      const decodedToken = jwtDecode<DecodedToken>(accessToken);
      return decodedToken.profile_picture || null;
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  },
}));
