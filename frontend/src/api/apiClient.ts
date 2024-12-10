import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Include cookies in requests
});

// Flags and queues to handle multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: any) => void;
}> = [];

// Process the queue after refresh attempt
const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Define URLs to exclude from interception
const excludedUrls = ['/auth/refresh', '/auth/login'];

// Refresh token function
export const refreshToken = async (): Promise<boolean> => {
  try {
    await api.post('/auth/refresh', null, {
      headers: { 'X-Refresh-Request': 'true' }, // Custom header to identify refresh requests
    });
    return true;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
};

// Axios response interceptor to handle token expiration
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If the request is to /auth/refresh or /auth/login, do not intercept
    if (excludedUrls.some(url => originalRequest.url?.includes(url))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch(err => Promise.reject(err));
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
            window.location.href = '/login'; // Redirect to login
            reject(error);
          }
        } catch (err) {
          processQueue(err);
          window.location.href = '/login'; // Redirect to login
          reject(err);
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(error);
  }
);

// API methods

/**
 * Create a new conversation.
 */
export const createConversation = () =>
  api.post('/conversations');

/**
 * Add a message to an existing conversation.
 * @param conversationId - ID of the conversation.
 * @param message - The message content.
 * @param model - The model to use.
 */
export const addMessage = (conversationId: string, message: string, model: string) =>
  api.post(`/conversations/${conversationId}/messages`, { message, model });

/**
 * Fetch messages for a conversation.
 */
export const fetchMessages = (conversationId: string) =>
  api.get(`/conversations/${conversationId}/messages`);

/**
 * Delete a conversation.
 */
export const deleteConversationAPI = (conversationId: string) =>
  api.delete(`/conversations/${conversationId}`);


export default api;
