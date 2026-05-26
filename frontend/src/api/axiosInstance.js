import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const instance = axios.create({ baseURL: API });

instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.dispatchEvent(new StorageEvent('storage', { key: 'token', newValue: null }));
    window.location.href = '/login';
};

instance.interceptors.response.use(
    res => res,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return instance(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            processQueue(error, null);
            isRefreshing = false;
            clearSession();
            return Promise.reject(error);
        }

        try {
            const { data } = await axios.post(`${API}/auth/refresh-token`, { refreshToken });
            const newToken = data.accessToken;
            localStorage.setItem('token', newToken);
            window.dispatchEvent(new StorageEvent('storage', { key: 'token', newValue: newToken }));
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
        } catch {
            processQueue(error, null);
            clearSession();
            return Promise.reject(error);
        } finally {
            isRefreshing = false;
        }
    }
);

export default instance;
