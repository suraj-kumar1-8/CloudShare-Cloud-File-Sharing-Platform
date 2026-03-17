import api from './axios';

/** Create a new folder. parentFolder is optional (null = root). */
export const createFolder = (data) => api.post('/folders/create', data);

/** List folders. Pass parentFolder id or omit for root. */
export const getFolders = (parentFolder = null) =>
  api.get('/folders', { params: parentFolder ? { parentFolder } : {} });

/** Get a single folder's contents (children + files + breadcrumb). */
export const getFolder = (id) => api.get(`/folders/${id}`);

/** Delete a folder (and all nested content). */
export const deleteFolder = (id) => api.delete(`/folders/${id}`);

/** Rename a folder. */
export const renameFolder = (id, name) => api.patch(`/folders/${id}/rename`, { name });
