import { useState, useEffect, useCallback } from 'react';
import { buildMediaUrl, mapLegacyPath, getFallbackUrl, validateMediaUrl } from '../utils/mediaUtils';
import { createComponentLogger } from '../utils/logger';

const logger = createComponentLogger('useMediaUrl');

interface UseMediaUrlOptions {
  mediaType?: 'images' | 'videos' | 'documents' | 'audio';
  courseId?: number;
  unitId?: number;
  enableValidation?: boolean;
  fallbackStrategy?: 'immediate' | 'after-error' | 'never';
}

interface UseMediaUrlReturn {
  url: string;
  isLoading: boolean;
  hasError: boolean;
  isValidated: boolean;
  retry: () => void;
}

export const useMediaUrl = (
  src: string | undefined,
  options: UseMediaUrlOptions = {}
): UseMediaUrlReturn => {
  const {
    mediaType = 'images',
    courseId,
    unitId,
    enableValidation = false,
    fallbackStrategy = 'after-error'
  } = options;

  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  const buildUrl = useCallback(() => {
    logger.debug('Building media URL', { src, courseId, unitId, mediaType });

    if (!src) {
      logger.warn('No media source provided, using fallback');
      if (fallbackStrategy === 'immediate') {
        setUrl(getFallbackUrl(mediaType));
        setIsLoading(false);
        return;
      }
    }

    let finalUrl = src || '';

    // Use legacy path mapping if we have course/unit context
    if (courseId && unitId) {
      finalUrl = mapLegacyPath(src || '', courseId, unitId);
    } else {
      finalUrl = buildMediaUrl(src || '', courseId, unitId, mediaType);
    }

    logger.debug('Final media URL built', { finalUrl });
    setUrl(finalUrl);
    setIsLoading(false);
  }, [src, courseId, unitId, mediaType, fallbackStrategy]);

  const validateUrl = useCallback(async (urlToValidate: string) => {
    if (!enableValidation || !urlToValidate) return;

    logger.debug('Validating media URL', { url: urlToValidate });
    setIsLoading(true);

    try {
      const isValid = await validateMediaUrl(urlToValidate);
      
      if (!isValid) {
        logger.warn('Media URL validation failed', { url: urlToValidate });
        setHasError(true);
        
        if (fallbackStrategy === 'after-error') {
          const fallbackUrl = getFallbackUrl(mediaType);
          logger.info('Using fallback URL', { fallbackUrl });
          setUrl(fallbackUrl);
        }
      } else {
        logger.success('Media URL validated successfully', { url: urlToValidate });
        setHasError(false);
      }
      
      setIsValidated(true);
    } catch (error) {
      logger.error('Media URL validation error', { error, url: urlToValidate });
      setHasError(true);
      
      if (fallbackStrategy === 'after-error') {
        setUrl(getFallbackUrl(mediaType));
      }
    } finally {
      setIsLoading(false);
    }
  }, [enableValidation, fallbackStrategy, mediaType]);

  const retry = useCallback(() => {
    setHasError(false);
    setIsValidated(false);
    setIsLoading(true);
    buildUrl();
  }, [buildUrl]);

  useEffect(() => {
    buildUrl();
  }, [buildUrl]);

  useEffect(() => {
    if (url && enableValidation && !isValidated) {
      validateUrl(url);
    }
  }, [url, enableValidation, isValidated, validateUrl]);

  return {
    url,
    isLoading,
    hasError,
    isValidated,
    retry
  };
};