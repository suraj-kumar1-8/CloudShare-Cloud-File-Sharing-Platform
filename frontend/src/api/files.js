import api from './axios';

/**
 * Upload a file to the backend.
 * @param {File}     file       - Browser File object
 * @param {Function} onProgress - optional progress callback (0-100)
 * @param {string}   folderId   - optional folder id to upload into
 */
export const uploadFile = (file, onProgress, folderId, expiresIn) => {
  const form = new FormData();
  form.append('file', file);
  if (folderId) form.append('folderId', folderId);
  if (expiresIn && expiresIn > 0) form.append('expiresIn', String(expiresIn));

  return api.post('/files/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
};

/** Fetch all files belonging to the current user. */
export const getFiles = () => api.get('/files');

/** Delete a file by its MongoDB id. */
export const deleteFile = (id) => api.delete(`/files/${id}`);

/** Rename a file. */
export const renameFile = (id, name) => api.patch(`/files/${id}/rename`, { name });

/** Get a pre-signed download URL for a file. */
export const getDownloadUrl = (id) => api.get(`/files/download/${id}`);

/** Upload a new version of an existing file. */
export const uploadFileVersion = (id, file, onProgress) => {
  const form = new FormData();
  form.append('file', file);

  return api.post(`/files/${id}/version`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
};

/** List previous versions and current version metadata for a file. */
export const getFileVersions = (id) => api.get(`/files/${id}/versions`);

/** Get a download URL for a specific file version. */
export const getFileVersionDownloadUrl = (id, versionNumber) =>
  api.get(`/files/${id}/versions/${versionNumber}`);

/** Get the activity timeline for a file. */
export const getFileActivity = (fileId) => api.get(`/files/activity/${fileId}`);

/**
 * Fetch (and lazily generate) the AI summary + keywords for a file.
 * Returns { summary, keywords, cached }.
 */
export const getFileSummary = (id, { refresh = false } = {}) =>
  api.get(`/files/${id}/summary`, {
    params: { refresh: refresh ? 'true' : undefined },
  });

/**
 * Ask a question about a specific file.
 * Body: { question, history? }
 * Returns { answer }.
 */
export const chatWithFile = (id, question, history = []) =>
  api.post(`/files/${id}/chat`, { question, history });

/** Generate a one-time download share link. */
export const shareOnce = (id, expiresIn = 0) =>
  api.post(`/files/share-once/${id}`, { expiresIn });

/**
 * Create (or refresh) a share link for a file.
 * @param {string} id         – file MongoDB id
 * @param {number} expiresIn  – hours until expiry: 1, 24, 168.  0 = no expiry.
 * @param {string} [password] – optional download password (plain-text; hashed server-side)
 */
export const createShareLink = (id, expiresIn, password) =>
  api.post(`/files/${id}/share`, { expiresIn, password: password || undefined });

/** Revoke an active share link. */
export const revokeShareLink = (id) => api.delete(`/files/${id}/share`);

/**
 * Fetch public metadata for a share link (no password required).
 * Returns { originalName, fileType, fileSize, shareExpiry, isPasswordProtected }
 */
export const getShareInfo = (token) => api.get(`/files/share/${token}/info`);

/**
 * Exchange a share token (+ optional password) for a direct download URL.
 * @param {string} token
 * @param {string} [password]
 */
export const downloadSharedFile = (token, password) =>
  api.post(`/files/share/${token}`, { password: password || undefined });

/**
 * Semantic-ish file search across the user's library.
 * Uses name, tags, keywords, and summary on the backend.
 */
export const searchFiles = (query) =>
  api.get('/files/search', { params: { q: query } });

/**
 * Import a whole folder structure.
 * @param {File[]} files   – File objects from an <input webkitdirectory>
 * @param {string[]} paths – matching relative paths (webkitRelativePath)
 * @param {string} rootName – top-level folder name (for display only)
 */
export const importFolder = (files, paths, rootName, onProgress) => {
  const form = new FormData();
  form.append('rootName', rootName);
  files.forEach((file, idx) => {
    form.append('files', file);
    form.append('paths', paths[idx] || file.name);
  });

  return api.post('/files/import/folder', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
};

/**
 * Import one or more ZIP archives. Each ZIP is extracted on the server and
 * its contents are stored in folders named after the ZIP file.
 */
export const importZip = (files, onProgress) => {
  const form = new FormData();
  files.forEach((file) => {
    form.append('files', file);
  });

  return api.post('/files/import/zip', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
};
