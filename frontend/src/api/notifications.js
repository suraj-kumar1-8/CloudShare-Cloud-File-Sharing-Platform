import api from './axios';

export const getNotifications = ()   => api.get('/notifications');
export const markAllRead      = ()   => api.patch('/notifications/read-all');
export const markRead         = (id) => api.patch(`/notifications/${id}/read`);
export const clearAll         = ()   => api.delete('/notifications');
