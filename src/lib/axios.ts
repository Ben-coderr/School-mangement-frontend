import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api',
});

// Request interceptor for auth token
api.interceptors.request.use(config => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY!) ||
            sessionStorage.getItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY!);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor for handling 401 errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY!);
                sessionStorage.removeItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY!);
                window.location.href = '/sign-in';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
