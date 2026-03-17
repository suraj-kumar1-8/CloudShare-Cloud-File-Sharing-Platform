const axios = require('axios');

/**
 * Centralised AI helper functions.
 *
 * These functions call an external LLM/vector service using environment
 * variables so you can plug in OpenAI, Azure OpenAI, or any other provider
 * without changing the rest of the codebase.
 */

const AI_API_URL = process.env.AI_API_URL || '';
const AI_API_KEY = process.env.AI_API_KEY || '';

const hasAiConfig = () => !!AI_API_URL && !!AI_API_KEY;

/**
 * Basic MIME-type based categorisation as a fallback when AI is not
 * configured or as a pre-classification hint.
 */
const inferCategoryFromMime = (mime = '') => {
  if (!mime) return 'other';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.includes('pdf') || mime.includes('word') || mime.includes('officedocument')) return 'document';
  if (mime.includes('text/')) return 'notes';
  if (mime.includes('javascript') || mime.includes('typescript') || mime.includes('x-python')) return 'code';
  return 'other';
};

/**
 * Ask the AI service to categorise a file and optionally generate tags.
 * Falls back to simple MIME-based categorisation when AI is not configured
 * or the call fails.
 */
async function classifyFile({ originalName, mimeType, previewText }) {
  const fallbackCategory = inferCategoryFromMime(mimeType);

  if (!hasAiConfig()) {
    return { category: fallbackCategory, tags: [] };
  }

  try {
    const payload = {
      name: originalName,
      mimeType,
      previewText,
    };

    const { data } = await axios.post(
      AI_API_URL,
      { task: 'classify-file', payload },
      { headers: { Authorization: `Bearer ${AI_API_KEY}` } },
    );

    return {
      category: data.category || fallbackCategory,
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  } catch (err) {
    // On any failure, just return the best-effort fallback to avoid
    // blocking uploads.
    return { category: fallbackCategory, tags: [] };
  }
}

/**
 * Ask the AI service to generate a short summary and keywords for a file.
 *
 * This assumes the external service can access the file via the provided
 * URL (for example, by downloading it from the app's /uploads endpoint).
 *
 * When AI is not configured or the call fails, this returns
 *   { summary: null, keywords: [] }
 * so callers can safely persist the result without blocking uploads.
 */
async function summarizeFile({ originalName, mimeType, fileUrl }) {
  if (!hasAiConfig()) {
    return { summary: null, keywords: [] };
  }

  try {
    const payload = {
      name: originalName,
      mimeType,
      fileUrl,
    };

    const { data } = await axios.post(
      AI_API_URL,
      { task: 'summarize-file', payload },
      { headers: { Authorization: `Bearer ${AI_API_KEY}` } },
    );

    return {
      summary:  data.summary  || null,
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
    };
  } catch (err) {
    return { summary: null, keywords: [] };
  }
}

/**
 * Ask the AI service a question about a specific file.
 * Returns { answer } or { answer: null } when AI is not configured
 * or the call fails. The external service is expected to handle
 * retrieving/processing the file content from fileUrl.
 */
async function chatWithFile({ originalName, mimeType, fileUrl, question, history }) {
  if (!hasAiConfig()) {
    return { answer: null };
  }

  try {
    const payload = {
      name:     originalName,
      mimeType,
      fileUrl,
      question,
      history:  history || [],
    };

    const { data } = await axios.post(
      AI_API_URL,
      { task: 'chat-with-file', payload },
      { headers: { Authorization: `Bearer ${AI_API_KEY}` } },
    );

    return { answer: data.answer || null };
  } catch (err) {
    return { answer: null };
  }
}

module.exports = {
  classifyFile,
  inferCategoryFromMime,
  summarizeFile,
  chatWithFile,
};
