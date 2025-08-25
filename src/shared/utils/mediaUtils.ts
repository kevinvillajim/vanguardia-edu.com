// Utility functions for handling media URLs from backend storage

const API_BASE_URL = (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000').replace(/\/$/, '');

/**
 * Builds the correct media URL for course assets stored in the backend
 * @param mediaPath - The media path from the backend (can be relative or absolute)
 * @param courseId - Optional course ID for organizing media
 * @param unitId - Optional unit ID for organizing media
 * @param mediaType - Type of media (images, videos, documents)
 */
export const buildMediaUrl = (
  mediaPath: string,
  courseId?: number,
  unitId?: number,
  mediaType: 'images' | 'videos' | 'documents' | 'audio' = 'images'
): string => {
  // If the path is already a full URL, return as is
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath;
  }

  // If the path starts with '/storage/' or any '/', it's already processed by backend
  if (mediaPath.startsWith('/')) {
    return `${API_BASE_URL}${mediaPath}`;
  }

  // Default: assume it's a relative path from storage
  return `${API_BASE_URL}/storage/${mediaPath}`;
};

/**
 * Extracts media information from a component's content
 * This helps identify the correct media type and path
 */
export const getMediaInfo = (content: any) => {
  const mediaInfo = {
    src: '',
    type: 'images' as 'images' | 'videos' | 'documents' | 'audio',
    filename: ''
  };

  // Handle different content structures from backend
  if (typeof content === 'string') {
    mediaInfo.src = content;
  } else if (content?.src || content?.url || content?.image) {
    mediaInfo.src = content.src || content.url || content.image;
  }

  // Determine media type from file extension
  const extension = mediaInfo.src.split('.').pop()?.toLowerCase();
  if (extension) {
    if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension)) {
      mediaInfo.type = 'videos';
    } else if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(extension)) {
      mediaInfo.type = 'audio';
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
      mediaInfo.type = 'documents';
    } else {
      mediaInfo.type = 'images';
    }
  }

  // Extract filename
  mediaInfo.filename = mediaInfo.src.split('/').pop() || mediaInfo.src;

  return mediaInfo;
};

/**
 * Maps media paths from backend to full URLs
 * The backend already processes paths with StorageHelper, we just need to add the base URL when needed
 */
export const mapLegacyPath = (originalPath: string, courseId?: number, unitId?: number): string => {
  // Guard against undefined or null paths
  if (!originalPath) {
    return getFallbackUrl('images');
  }

  // If path already starts with /storage/, backend has already processed it - just add base URL
  if (originalPath.startsWith('/storage/')) {
    return `${API_BASE_URL}${originalPath}`;
  }

  // If it's already a full URL, return as is
  if (originalPath.startsWith('http://') || originalPath.startsWith('https://')) {
    return originalPath;
  }

  // For any other path, assume it needs the base URL prefix
  // The backend should have already processed it correctly with StorageHelper
  if (originalPath.startsWith('/')) {
    return `${API_BASE_URL}${originalPath}`;
  }

  // Fallback to building URL with storage prefix
  return `${API_BASE_URL}/storage/${originalPath}`;
};

/**
 * Validates if a media URL is accessible
 * @param url - The media URL to validate
 * @returns Promise<boolean> - Whether the URL is accessible
 */
export const validateMediaUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Gets fallback URL for media that fails to load
 */
export const getFallbackUrl = (mediaType: 'images' | 'videos' | 'documents' | 'audio' = 'images'): string => {
  const fallbacks = {
    images: `${API_BASE_URL}/storage/default-image.svg`,
    videos: `${API_BASE_URL}/storage/default-video-poster.svg`,
    documents: `${API_BASE_URL}/storage/default-document.svg`,
    audio: `${API_BASE_URL}/storage/default-audio.svg`
  };
  
  return fallbacks[mediaType];
};