import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const excludedUrls = ["/auth/refresh", "/auth/login"];

export const refreshToken = async (): Promise<boolean> => {
  try {
    await api.post("/auth/refresh", null, {
      headers: { "X-Refresh-Request": "true" },
    });
    return true;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return false;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (excludedUrls.some((url) => originalRequest.url?.includes(url))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          const success = await refreshToken();
          if (success) {
            processQueue(null);
            resolve(api(originalRequest));
          } else {
            processQueue(error);
            window.location.href = "/login";
            reject(error);
          }
        } catch (err) {
          processQueue(err);
          window.location.href = "/login";
          reject(err);
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(error);
  }
);

export const createConversation = () => api.post("/conversations");

export const addMessage = (
  conversationId: string | undefined,
  message: string,
  model: string
) => api.post(`/conversations/${conversationId}/messages`, { message, model });

export const fetchMessages = (conversationId: string) =>
  api.get(`/conversations/${conversationId}/messages`);

export const deleteConversationAPI = (conversationId: string) =>
  api.delete(`/conversations/${conversationId}`);

export default api;
