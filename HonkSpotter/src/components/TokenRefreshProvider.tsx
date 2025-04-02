import { useEffect, useState } from 'react';
import { refreshAccessToken } from '@/api/apiClient';

const TokenRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    const refreshToken = async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Failed to refresh token:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    refreshToken();
  }, []);

  if (isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default TokenRefreshProvider;

