import api from './axios';

export const getProfile     = ()             => api.get('/profile');
export const updateProfile  = (data)         => api.patch('/profile', data);
export const changePassword = (data)         => api.patch('/profile/password', data);
export const uploadAvatar   = (formData)     => api.post('/profile/avatar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
