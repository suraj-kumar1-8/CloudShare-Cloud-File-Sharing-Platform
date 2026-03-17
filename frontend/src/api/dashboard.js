import api from './axios';

/** Fetch aggregated dashboard data for the authenticated user. */
export const getDashboard = () => api.get('/dashboard');
