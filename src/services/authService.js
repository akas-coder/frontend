import api from './api';

const authService = {
    // Register new user
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Registration failed' };
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { token, username } = response.data;
            
            // Store token and username
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Login failed' };
        }
    },

    // Logout user
    logout: async () => {
        const username = localStorage.getItem('username');
        if (username) {
            try {
                await api.post(`/auth/logout?username=${username}`);
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    },

    // Request OTP for password reset
    requestOtp: async (email) => {
        try {
            const response = await api.post('/password-reset/request-otp', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Failed to send OTP' };
        }
    },

    // Verify OTP
    verifyOtp: async (email, otp) => {
        try {
            const response = await api.post('/password-reset/verify-otp', { email, otp });
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Invalid OTP' };
        }
    },

    // Reset password
    resetPassword: async (email, otp, newPassword) => {
        try {
            const response = await api.post('/password-reset/reset-password', {
                email,
                otp,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'Password reset failed' };
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Get current username
    getCurrentUser: () => {
        return localStorage.getItem('username');
    }
};

export default authService;