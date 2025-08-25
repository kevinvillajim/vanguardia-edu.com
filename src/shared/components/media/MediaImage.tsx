import React from 'react';
import { useMediaUrl } from '../../hooks/useMediaUrl';
import { ImageOff, RotateCcw } from 'lucide-react';
import { logger } from '../../utils/logger';

interface MediaImageProps {
  /** Image source path from backend storage */
  src: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Custom CSS classes */
  className?: string;
  /** Optional course ID for media organization */
  courseId?: number;
  /** Optional unit ID for media organization */
  unitId?: number;
  /** Enable validation of the URL */
  enableValidation?: boolean;
  /** Fallback strategy when image fails */
  fallbackStrategy?: 'immediate' | 'after-error' | 'never';
  /** Loading placeholder */
  loadingPlaceholder?: React.ReactNode;
  /** Error placeholder */
  errorPlaceholder?: React.ReactNode;
}

/**
 * MediaImage component that properly handles image URLs from backend storage
 * Automatically builds correct URLs for images stored in /storage/uploads/files/ etc.
 */
export const MediaImage: React.FC<MediaImageProps> = ({
  src,
  alt = 'Image',
  className = '',
  courseId,
  unitId,
  enableValidation = false,
  fallbackStrategy = 'after-error',
  loadingPlaceholder,
  errorPlaceholder
}) => {
  const {
    url: imageUrl,
    isLoading,
    hasError,
    retry
  } = useMediaUrl(src, {
    mediaType: 'images',
    courseId,
    unitId,
    enableValidation,
    fallbackStrategy
  });

  // Debug logs
  logger.debug('MediaImage render:', { src, imageUrl, isLoading, hasError });

  // Loading state
  if (isLoading) {
    if (loadingPlaceholder) {
      return <>{loadingPlaceholder}</>;
    }
    
    return (
      <div className={`bg-gray-200 animate-pulse rounded flex items-center justify-center ${className}`}>
        <ImageOff className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  // Error state
  if (hasError) {
    if (errorPlaceholder) {
      return <>{errorPlaceholder}</>;
    }

    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center p-4 ${className}`}>
        <ImageOff className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 mb-2">Failed to load image</p>
        <button
          onClick={retry}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Retry
        </button>
      </div>
    );
  }

  // Success state
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
    />
  );
};

export default MediaImage;