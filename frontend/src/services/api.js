import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Meetings API
export const meetingsAPI = {
  getAll: (params) => api.get('/meetings', { params }),
  getById: (id) => api.get(`/meetings/${id}`),
  create: (data) => api.post('/meetings', data),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  delete: (id) => api.delete(`/meetings/${id}`),
  getStats: () => api.get('/meetings/stats/overview'),
  
  // Action items
  addActionItem: (meetingId, data) => 
    api.post(`/meetings/${meetingId}/action-items`, data),
  updateActionItem: (meetingId, actionId, data) => 
    api.put(`/meetings/${meetingId}/action-items/${actionId}`, data),
  deleteActionItem: (meetingId, actionId) => 
    api.delete(`/meetings/${meetingId}/action-items/${actionId}`),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getStats: () => api.get('/users/stats'),
  getDashboard: () => api.get('/users/dashboard'),
  getActionItems: (params) => api.get('/users/action-items', { params }),
};

// Upload API
export const uploadAPI = {
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
  
  uploadMultiple: (files, onProgress) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
  
  deleteFile: (filename) => api.delete(`/upload/${filename}`),
  downloadFile: (filename) => api.get(`/upload/${filename}`, { responseType: 'blob' }),
};

// AI Processing API
export const aiAPI = {
  processMeeting: (fileData, options) => 
    api.post('/ai/process-meeting', { fileData, options }),
  transcribeAudio: (fileData) => 
    api.post('/ai/transcribe', { fileData }),
  summarizeText: (text, options) => 
    api.post('/ai/summarize', { text, options }),
  extractActionItems: (text) => 
    api.post('/ai/extract-action-items', { text }),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
