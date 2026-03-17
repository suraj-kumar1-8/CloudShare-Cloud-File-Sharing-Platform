import api from './axios';

/** GET /api/user/storage — returns { storageUsed, storageLimit, percentage } */
export const getStorage = () => api.get('/user/storage');

/**
 * POST /api/files/share-email
 * @param {string} fileId
 * @param {string} recipientEmail
 * @param {number} expiresIn   – hours (0 = no expiry)
 * @param {string} [message]   – optional personal note
 */
export const shareByEmail = (fileId, recipientEmail, expiresIn = 0, message = '') =>
  api.post('/files/share-email', { fileId, recipientEmail, expiresIn, message });
