import api from './axios';

/** Create a new sharing room. */
export const createRoom = (roomName, expiresIn = '24h') =>
  api.post('/rooms/create', { roomName, expiresIn });

/** Get current user's rooms. */
export const listRooms = () => api.get('/rooms');

/** Get a single room by its short roomId (public). */
export const getRoom = (roomId) => api.get(`/rooms/${roomId}`);

/** Upload a file into a room. */
export const uploadToRoom = (roomId, file, onProgress) => {
  const form = new FormData();
  form.append('roomId', roomId);
  form.append('file', file);
  return api.post('/rooms/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
};

/**
 * Submit an assignment to a room (public endpoint).
 * @param {string} roomId
 * @param {string} studentName
 * @param {File}   file
 */
export const submitAssignment = (roomId, studentName, file, onProgress) => {
  const form = new FormData();
  form.append('studentName', studentName);
  form.append('file', file);
  return api.post(`/rooms/${roomId}/submit`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
};

/** Get all submissions for a room (teacher only). */
export const getSubmissions = (roomId) => api.get(`/rooms/${roomId}/submissions`);

/** Delete a single submission from a room (teacher only). */
export const deleteSubmission = (roomId, submissionId) =>
  api.delete(`/rooms/${roomId}/submissions/${submissionId}`);

/** Delete a room (owner only). */
export const deleteRoom = (roomId) => api.delete(`/rooms/${roomId}`);
