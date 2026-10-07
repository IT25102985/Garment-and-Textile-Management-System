import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:8080/api' : '/api',
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status !== 401 && error.response.status !== 403) {
            toast.error(error.response.data?.message || error.response.data || 'An error occurred during the request.');
        } else if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            toast.error('Unauthorized access. Please login again.');
        } else {
            toast.error('Network or Server Error.');
        }
        return Promise.reject(error);
    }
);

export default api;
