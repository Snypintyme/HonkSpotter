import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const apiURL = import.meta.env.VITE_API_URL;

const getCookieValue = (name: string): string | null => {
  const matches = document.cookie.match(
    // eslint-disable-next-line no-useless-escape
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : null;
};

export const refreshAccessToken = async (): Promise<string> => {
  const accessToken = useAuthStore.getState().accessToken;
  const csrfToken = getCookieValue('csrf_refresh_token');
  const refreshResponse = await axios.post(
    `${apiURL}/api/refresh`,
    { access_token: accessToken },
    { withCredentials: true, headers: { 'X-CSRF-TOKEN': csrfToken } }
  );
  const newAccessToken = refreshResponse.data.access_token;
  useAuthStore.getState().setAccessToken(newAccessToken);
  return newAccessToken;
};

const apiClient = axios.create({
  baseURL: `${apiURL}/api`,
  withCredentials: true,
});

// Request interceptor: attach access token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    const result = {
      ...config,
    };

    if (token) {
      result.headers = {
        Authorization: `Bearer ${token}`,
        ...result.headers,
      } as AxiosRequestHeaders;
    }

    return result;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors by attempting to refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAccessToken();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
