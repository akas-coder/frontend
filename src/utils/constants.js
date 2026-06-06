export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

export const ROUTES = {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    CHAT: '/chat',
    ROOM_CHAT: '/chat/room',
    PRIVATE_CHAT: '/chat/private',
};

export const MESSAGE_TYPES = {
    CHAT: 'CHAT',
    JOIN: 'JOIN',
    LEAVE: 'LEAVE',
    TYPING: 'TYPING',
};