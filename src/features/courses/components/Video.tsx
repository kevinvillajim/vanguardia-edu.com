import React, { useEffect, useRef, createContext, useContext, useState, useCallback } from 'react';
import { VideoOff, RotateCcw, Play } from 'lucide-react';
import { useMediaUrl } from '../../../shared/hooks/useMediaUrl';
import { createComponentLogger } from '../../../shared/utils/logger';

const logger = createComponentLogger('Video');

// Create a context to share state between all videos
interface VideoContextType {
  registerPlayer: (player: HTMLVideoElement) => void;
  unregisterPlayer: (player: HTMLVideoElement) => void;
  pauseOthers: (currentPlayer: HTMLVideoElement) => void;
}

const VideoContext = createContext<VideoContextType | null>(null);

interface VideoProviderProps {
  children: React.ReactNode;
}

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const players = useRef(new Set<HTMLVideoElement>());

  const registerPlayer = useCallback((player: HTMLVideoElement) => {
    players.current.add(player);
    logger.debug('Video player registered', { playersCount: players.current.size });
  }, []);

  const unregisterPlayer = useCallback((player: HTMLVideoElement) => {
    players.current.delete(player);
    logger.debug('Video player unregistered', { playersCount: players.current.size });
  }, []);

  const pauseOthers = useCallback((currentPlayer: HTMLVideoElement) => {
    let pausedCount = 0;
    players.current.forEach((player) => {
      if (player !== currentPlayer && !player.paused) {
        player.pause();
        pausedCount++;
      }
    });
    logger.debug('Paused other video players', { pausedCount });
  }, []);

  return (
    <VideoContext.Provider
      value={{ registerPlayer, unregisterPlayer, pauseOthers }}
    >
      {children}
    </VideoContext.Provider>
  );
};

interface VideoProps {
  /** Video source path or URL */
  src: string;
  /** Optional poster image for video thumbnail */
  poster?: string;
  /** Video title for accessibility */
  title?: string;
  /** Optional course ID for media organization */
  courseId?: number;
  /** Optional unit ID for media organization */
  unitId?: number;
  /** Custom CSS classes */
  className?: string;
  /** Auto-play video (use carefully for UX) */
  autoPlay?: boolean;
  /** Show video controls */
  controls?: boolean;
  /** Video preload strategy */
  preload?: 'none' | 'metadata' | 'auto';
  /** Loading component */
  LoadingComponent?: React.ComponentType;
  /** Error component */
  ErrorComponent?: React.ComponentType<{ onRetry: () => void }>;
}

/**
 * Video component with global playback management and error handling
 * Follows clean architecture principles and accessibility best practices
 */
export const Video: React.FC<VideoProps> = ({
  src,
  poster,
  title = 'Video educativo',
  courseId,
  unitId,
  className = '',
  autoPlay = false,
  controls = true,
  preload = 'none',
  LoadingComponent,
  ErrorComponent
}) => {
  const playerRef = useRef<HTMLVideoElement>(null);
  const context = useContext(VideoContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Video URL with proper media handling
  const {
    url: videoUrl,
    isLoading: videoLoading,
    hasError: videoError,
    retry: retryVideo
  } = useMediaUrl(src, {
    mediaType: 'videos',
    courseId,
    unitId,
    fallbackStrategy: 'after-error'
  });

  // Poster URL with proper media handling
  const {
    url: posterUrl,
    hasError: posterError
  } = useMediaUrl(poster, {
    mediaType: 'images',
    courseId,
    unitId,
    fallbackStrategy: 'never' // Don't fallback for posters
  });

  logger.debug('Video component rendered', {
    src,
    videoUrl,
    posterUrl,
    title,
    videoLoading,
    videoError
  });

  // Warn if VideoProvider is not available
  useEffect(() => {
    if (!context) {
      logger.warn('Video component used without VideoProvider. Multiple video management will not work.');
    }
  }, [context]);

  // Register/unregister player with global context
  useEffect(() => {
    const player = playerRef.current;
    if (player && context) {
      const handlePlay = () => {
        context.pauseOthers(player);
        setIsPlaying(true);
      };
      
      const handlePause = () => {
        setIsPlaying(false);
      };

      player.addEventListener('play', handlePlay);
      player.addEventListener('pause', handlePause);
      context.registerPlayer(player);

      return () => {
        player.removeEventListener('play', handlePlay);
        player.removeEventListener('pause', handlePause);
        context.unregisterPlayer(player);
      };
    }
  }, [context]);

  const handleVideoClick = useCallback(() => {
    const player = playerRef.current;
    if (!player || videoError) return;

    setUserInteracted(true);
    
    if (player.paused) {
      player.play().catch((error) => {
        logger.error('Failed to play video', { error, videoUrl });
      });
    } else {
      player.pause();
    }
  }, [videoError, videoUrl]);

  const handleVideoError = useCallback(() => {
    logger.error('Video failed to load', { videoUrl, src });
  }, [videoUrl, src]);

  const handleVideoLoad = useCallback(() => {
    logger.success('Video loaded successfully', { videoUrl });
  }, [videoUrl]);

  const retry = useCallback(() => {
    retryVideo();
    setUserInteracted(false);
  }, [retryVideo]);

  // Loading state
  if (videoLoading && LoadingComponent) {
    return <LoadingComponent />;
  }

  // Error state with custom component
  if (videoError && ErrorComponent) {
    return <ErrorComponent onRetry={retry} />;
  }

  // Default error state
  if (videoError) {
    return (
      <div className={`relative bg-gray-200 dark:bg-gray-800 rounded-lg mx-8 my-8 p-8 flex items-center justify-center min-h-[300px] ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <VideoOff className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No se pudo cargar el video</h3>
          <p className="text-sm mb-4">Verifica tu conexión a internet e inténtalo de nuevo</p>
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative mx-8 my-8 ${className}`}>
      <video
        ref={playerRef}
        controls={controls}
        preload={preload}
        poster={posterError ? undefined : posterUrl}
        title={title}
        className="w-full rounded-lg shadow-lg"
        onClick={handleVideoClick}
        onError={handleVideoError}
        onLoadedData={handleVideoLoad}
        autoPlay={autoPlay && userInteracted} // Only autoplay after user interaction
        aria-label={title}
        aria-describedby={`video-description-${src}`}
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
        <track
          kind="captions"
          src={videoUrl.replace(/\.[^/.]+$/, '.vtt')}
          srcLang="es"
          label="Español"
          default
        />
        <p>
          Tu navegador no soporta videos HTML5. 
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
            Descargar video
          </a>
        </p>
      </video>

      {/* Custom play button overlay for better UX */}
      {!userInteracted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handleVideoClick}
            className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-4 transition-all duration-200 transform hover:scale-110"
            aria-label={`Reproducir ${title}`}
          >
            <Play className="w-12 h-12" />
          </button>
        </div>
      )}

      {/* Screen reader description */}
      <div id={`video-description-${src}`} className="sr-only">
        {title}. Video educativo del curso.
      </div>
    </div>
  );
};

export default Video;