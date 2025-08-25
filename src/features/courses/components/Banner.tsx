import React from 'react';
import { ChevronDown, ImageOff, RotateCcw } from 'lucide-react';
import { useMediaUrl } from '../../../shared/hooks/useMediaUrl';
import { createComponentLogger } from '../../../shared/utils/logger';

const logger = createComponentLogger('Banner');

interface BannerProps {
  /** Image source path or URL */
  img?: string;
  /** Banner title text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional description text */
  description?: string;
  /** Optional course ID for media organization */
  courseId?: number;
  /** Optional unit ID for media organization */
  unitId?: number;
  /** Custom CSS classes */
  className?: string;
  /** Click handler for scroll indicator */
  onScrollClick?: () => void;
  /** Loading component */
  LoadingComponent?: React.ComponentType;
  /** Error component */
  ErrorComponent?: React.ComponentType<{ onRetry: () => void }>;
}

/**
 * Banner component for displaying course headers with background images
 * Follows clean architecture principles with proper separation of concerns
 */
export const Banner: React.FC<BannerProps> = ({
  img,
  title,
  subtitle,
  description,
  courseId,
  unitId,
  className = '',
  onScrollClick,
  LoadingComponent,
  ErrorComponent
}) => {
  const {
    url: bannerUrl,
    isLoading,
    hasError,
    retry
  } = useMediaUrl(img, {
    mediaType: 'images',
    courseId,
    unitId,
    enableValidation: false, // We'll handle errors via image onError
    fallbackStrategy: 'after-error'
  });

  logger.debug('Banner rendered', { 
    title, 
    img, 
    bannerUrl, 
    isLoading, 
    hasError 
  });

  // Loading state
  if (isLoading && LoadingComponent) {
    return <LoadingComponent />;
  }

  // Error state with custom component
  if (hasError && ErrorComponent) {
    return <ErrorComponent onRetry={retry} />;
  }

  // Default error state
  if (hasError) {
    return (
      <div className={`h-[28rem] bg-gray-800 dark:bg-gray-900 flex justify-center items-center ${className}`}>
        <div className="bg-black bg-opacity-50 h-full w-full flex justify-start items-center relative">
          <div className="w-[60%] flex px-8">
            <div className="text-left">
              <h1 className="font-bold text-white text-4xl drop-shadow-lg">
                {title}
              </h1>
              {subtitle && (
                <p className="text-white text-xl mt-2 opacity-90 drop-shadow-lg">
                  {subtitle}
                </p>
              )}
              {description && (
                <p className="text-white text-base mt-2 opacity-80 drop-shadow-lg max-w-2xl">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {/* Error indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-center text-gray-400">
              <ImageOff className="w-16 h-16 mx-auto mb-2" />
              <p className="text-sm mb-2">Banner no disponible</p>
              <button
                onClick={retry}
                className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reintentar
              </button>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <ScrollIndicator onClick={onScrollClick} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-[28rem] bg-black bg-fixed ${className}`}
      style={{
        backgroundImage: `url("${bannerUrl}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-black bg-opacity-50 h-full w-full flex justify-start items-center relative">
        {/* Hidden image for loading detection */}
        <img
          src={bannerUrl}
          alt={title}
          className="hidden"
          onLoad={() => logger.success('Banner image loaded', { bannerUrl })}
          onError={() => {
            logger.error('Banner image failed to load', { bannerUrl });
            retry();
          }}
        />
        
        {/* Title content */}
        <div className="w-[60%] flex px-8">
          <div className="text-left">
            <h1 className="font-bold text-white text-4xl drop-shadow-lg">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white text-xl mt-2 opacity-90 drop-shadow-lg">
                {subtitle}
              </p>
            )}
            {description && (
              <p className="text-white text-base mt-2 opacity-80 drop-shadow-lg max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <ScrollIndicator onClick={onScrollClick} />
      </div>
    </div>
  );
};

/**
 * Reusable scroll indicator component
 */
const ScrollIndicator: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div className="w-8 h-8 bottom-5 right-1/2 flex justify-center absolute">
    <button
      onClick={onClick}
      className="text-white hover:text-gray-300 transition-colors duration-200 animate-bounce"
      aria-label="Scroll down"
    >
      <ChevronDown className="w-16 h-16" />
    </button>
  </div>
);

export default Banner;