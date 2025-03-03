import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // TODO: move to env
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
        const refreshResponse = await axios.post('http://localhost:8080/api/refresh', {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data.access_token;
        useAuthStore.getState().setAccessToken(newAccessToken);

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

