import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Image upload function
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await api.post('/files/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to upload image' };
    }
};

// Get chat history
export const getChatHistory = async (type, param1, param2) => {
    try {
        let url;
        if (type === 'room') {
            url = `/chat/room/${param1}/messages`;
        } else if (type === 'private') {
            url = `/chat/private/${param1}/${param2}/messages`;
        }
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch messages' };
    }
};

// Delete message
export const deleteMessage = async (messageId, username) => {
    try {
        const response = await api.delete(`/chat/message/${messageId}?username=${username}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to delete message' };
    }
};

// Mark message as read
export const markMessageAsRead = async (messageId) => {
    try {
        const response = await api.put(`/chat/message/${messageId}/read`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to mark as read' };
    }
};

// Get user last seen
export const getUserLastSeen = async (username) => {
    try {
        const response = await api.get(`/chat/user/${username}/last-seen`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch last seen' };
    }
};

export default api;