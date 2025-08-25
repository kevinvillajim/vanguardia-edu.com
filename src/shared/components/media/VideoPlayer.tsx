import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward,
  Download,
  Loader2,
  Maximize,
  Minimize,
  Settings,
  AlertCircle,
  Signal,
  WifiOff
} from 'lucide-react';
import Button from '../../../components/ui/Button/Button';
import { buildMediaUrl } from '../../utils/mediaUtils';
import { createComponentLogger } from '../../utils/logger';
import { getMediaCompletionPercentage } from '../../../config';

const logger = createComponentLogger('VideoPlayer');

interface VideoPlayerProps {
  /** URL del archivo de video */
  src: string;
  /** Título del video (opcional) */
  title?: string;
  /** Descripción del video (opcional) */
  description?: string;
  /** URL de la imagen de poster (opcional) */
  poster?: string;
  /** Auto reproducir al cargar */
  autoPlay?: boolean;
  /** Mostrar controles de descarga */
  showDownload?: boolean;
  /** Ancho del video */
  width?: string | number;
  /** Alto del video */
  height?: string | number;
  /** Callback cuando inicia la reproducción */
  onPlay?: () => void;
  /** Callback cuando se pausa */
  onPause?: () => void;
  /** Callback cuando termina */
  onEnded?: () => void;
  /** Callback para progress de carga */
  onLoadProgress?: (loaded: number, total: number) => void;
  /** Callback para progress de reproducción */
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  /** ID del curso para sistema de prerrequisitos */
  courseId?: number | string;
  /** ID del módulo para sistema de prerrequisitos */
  moduleId?: number | string;
  /** ID del componente para sistema de prerrequisitos */
  componentId?: string;
  /** Callback cuando se completa el 95% del video */
  onProgress95?: () => void;
}

interface VideoState {
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  loadedPercent: number;
  canPlay: boolean;
  hasError: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  quality: 'auto' | 'high' | 'medium' | 'low';
  networkState: 'loading' | 'idle' | 'noSource' | 'networkError';
  watchTimeCounter: number; // Contador interno de tiempo visto
  hasReached95: boolean;    // Si ya alcanzó el 95%
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  description,
  poster,
  autoPlay = false,
  showDownload = false,
  width = '100%',
  height = 'auto',
  onPlay,
  onPause,
  onEnded,
  onLoadProgress,
  onTimeUpdate,
  courseId,
  moduleId,
  componentId,
  onProgress95
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const watchTimeIntervalRef = useRef<NodeJS.Timeout>();
  const lastUpdateTimeRef = useRef<number>(0);
  
  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    isLoading: true,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    loadedPercent: 0,
    canPlay: false,
    hasError: false,
    isFullscreen: false,
    playbackRate: 1,
    quality: 'auto',
    networkState: 'loading',
    watchTimeCounter: 0,
    hasReached95: false
  });

  // Formatear tiempo en mm:ss
  const formatTime = useCallback((seconds: number): string => {
    if (!isFinite(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Función para verificar progreso considerando velocidad de reproducción y configuración
  const checkProgressCompletion = useCallback(() => {
    if (state.hasReached95 || !state.duration) return;
    
    // Obtener porcentaje de configuración centralizada
    const configPercentage = getMediaCompletionPercentage('video') / 100; // Convertir a decimal
    
    // Calcular tiempo ajustado por velocidad: tiempo_real / velocidad_reproduccion
    const adjustedDuration = state.duration / state.playbackRate;
    const requiredTime = adjustedDuration * configPercentage;
    
    if (state.watchTimeCounter >= requiredTime) {
      setState(prev => ({ ...prev, hasReached95: true }));
      
      logger.success(`Video ${Math.round(configPercentage * 100)}% completed`, {
        watchTimeCounter: state.watchTimeCounter,
        adjustedDuration: adjustedDuration,
        requiredTime: requiredTime,
        configPercentage: configPercentage * 100,
        playbackRate: state.playbackRate,
        courseId,
        moduleId,
        componentId
      });
      
      onProgress95?.();
    }
  }, [state.watchTimeCounter, state.duration, state.playbackRate, state.hasReached95, onProgress95, courseId, moduleId, componentId]);

  // Función para iniciar el contador de tiempo visto
  const startWatchTimeCounter = useCallback(() => {
    if (watchTimeIntervalRef.current) {
      clearInterval(watchTimeIntervalRef.current);
    }
    
    lastUpdateTimeRef.current = Date.now();
    
    watchTimeIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeDelta = (now - lastUpdateTimeRef.current) / 1000; // Convertir a segundos
      lastUpdateTimeRef.current = now;
      
      setState(prev => {
        const newWatchTime = prev.watchTimeCounter + timeDelta;
        return { ...prev, watchTimeCounter: newWatchTime };
      });
    }, 1000); // Actualizar cada segundo
  }, []);

  // Función para detener el contador de tiempo visto
  const stopWatchTimeCounter = useCallback(() => {
    if (watchTimeIntervalRef.current) {
      clearInterval(watchTimeIntervalRef.current);
      watchTimeIntervalRef.current = undefined;
    }
  }, []);

  // Handlers de eventos de video
  const handleLoadStart = useCallback(() => {
    logger.debug('Video load start');
    setState(prev => ({ ...prev, isLoading: true, networkState: 'loading' }));
  }, []);

  const handleCanPlay = useCallback(() => {
    logger.success('Video can play');
    setState(prev => ({ 
      ...prev, 
      canPlay: true, 
      isLoading: false, 
      networkState: 'idle' 
    }));
  }, []);

  const handleCanPlayThrough = useCallback(() => {
    setState(prev => ({ ...prev, isBuffering: false }));
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    setState(prev => ({ ...prev, duration: video.duration || 0 }));
    logger.debug('Video metadata loaded', { duration: video.duration });
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || isDragging) return;

    const currentTime = video.currentTime;
    const duration = video.duration || 0;
    
    setState(prev => ({ ...prev, currentTime }));
    onTimeUpdate?.(currentTime, duration);
  }, [isDragging, onTimeUpdate]);

  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const buffered = video.buffered;
    const duration = video.duration || 0;
    
    if (buffered.length > 0 && duration > 0) {
      const loadedPercent = (buffered.end(buffered.length - 1) / duration) * 100;
      setState(prev => ({ ...prev, loadedPercent }));
      onLoadProgress?.(buffered.end(buffered.length - 1), duration);
    }
  }, [onLoadProgress]);

  const handleWaiting = useCallback(() => {
    logger.debug('Video buffering...');
    setState(prev => ({ ...prev, isBuffering: true }));
  }, []);

  const handlePlaying = useCallback(() => {
    logger.debug('Video playing');
    setState(prev => ({ ...prev, isBuffering: false, isPlaying: true }));
    startWatchTimeCounter(); // Iniciar contador cuando reproduce
    onPlay?.();
  }, [onPlay, startWatchTimeCounter]);

  const handlePause = useCallback(() => {
    logger.debug('Video paused');
    setState(prev => ({ ...prev, isPlaying: false }));
    stopWatchTimeCounter(); // Detener contador cuando pausa
    onPause?.();
  }, [onPause, stopWatchTimeCounter]);

  const handleEnded = useCallback(() => {
    logger.debug('Video ended');
    setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    stopWatchTimeCounter(); // Detener contador cuando termina
    onEnded?.();
  }, [onEnded, stopWatchTimeCounter]);

  const handleError = useCallback((e?: Event) => {
    const video = videoRef.current;
    let errorDetails = 'Error desconocido';
    let errorCode = 'UNKNOWN';
    
    if (video && video.error) {
      switch (video.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorDetails = 'Reproducción abortada por el usuario';
          errorCode = 'ABORTED';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorDetails = 'Error de red durante la descarga';
          errorCode = 'NETWORK';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorDetails = 'Error al decodificar el archivo de video';
          errorCode = 'DECODE';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorDetails = 'Formato de video no soportado';
          errorCode = 'FORMAT';
          break;
        default:
          errorDetails = 'Error al cargar el video';
          errorCode = 'LOAD';
      }
    }
    
    logger.error('Video error:', {
      code: errorCode,
      details: errorDetails,
      originalSrc: src,
      fullUrl: buildMediaUrl(src, undefined, undefined, 'videos'),
      event: e
    });
    
    setState(prev => ({ 
      ...prev, 
      hasError: true, 
      isLoading: false, 
      networkState: 'networkError' 
    }));
  }, [src]);

  const handleVolumeChange = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    setState(prev => ({ 
      ...prev, 
      volume: video.volume,
      isMuted: video.muted 
    }));
  }, []);

  // Controles de reproducción
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (state.isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        logger.error('Error playing video:', error);
      });
    }
  }, [state.isPlaying]);

  const seek = useCallback((percent: number) => {
    const video = videoRef.current;
    if (!video || !state.duration) return;

    const newTime = (percent / 100) * state.duration;
    video.currentTime = newTime;
    setState(prev => ({ ...prev, currentTime: newTime }));
  }, [state.duration]);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(state.duration, state.currentTime + seconds));
    video.currentTime = newTime;
  }, [state.currentTime, state.duration]);

  const setVolume = useCallback((volume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = Math.max(0, Math.min(1, volume));
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!state.isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [state.isFullscreen]);

  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setState(prev => ({ ...prev, playbackRate: rate }));
    setShowSettings(false);
  }, []);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = buildMediaUrl(src, undefined, undefined, 'videos');
    link.download = title || 'video';
    link.click();
  }, [src, title]);

  // Manejo de controles de mouse
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (state.isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [state.isPlaying]);

  const handleMouseLeave = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (state.isPlaying) {
        setShowControls(false);
      }
    }, 1000);
  }, [state.isPlaying]);

  // Manejo de drag en la barra de progreso
  const handleProgressMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;

    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    seek(percent);
  }, [seek]);

  const handleProgressMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;

    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    seek(percent);
  }, [isDragging, seek]);

  const handleProgressMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Manejo de drag en control de volumen
  const handleVolumeMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = volumeRef.current?.getBoundingClientRect();
    if (!rect) return;

    const volume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(volume);
  }, [setVolume]);

  // Efectos
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [
    handleLoadStart, handleCanPlay, handleCanPlayThrough, handleLoadedMetadata,
    handleTimeUpdate, handleProgress, handleWaiting, handlePlaying, 
    handlePause, handleEnded, handleError, handleVolumeChange
  ]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleProgressMouseMove);
      document.addEventListener('mouseup', handleProgressMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleProgressMouseMove);
        document.removeEventListener('mouseup', handleProgressMouseUp);
      };
    }
  }, [isDragging, handleProgressMouseMove, handleProgressMouseUp]);

  // Inicializar video cuando esté listo
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    logger.debug('Inicializando video con src:', src);

    // Construir URL correcta usando el helper para archivos de video
    const fullUrl = buildMediaUrl(src, undefined, undefined, 'videos');
    logger.debug('Construyendo URL de video:', {
      originalSrc: src,
      fullUrl: fullUrl,
      hasHttpProtocol: fullUrl.startsWith('http')
    });

    // Validar que la URL sea válida
    try {
      new URL(fullUrl);
    } catch (error) {
      logger.error('URL de video inválida:', fullUrl, error);
      setState(prev => ({
        ...prev,
        hasError: true,
        isLoading: false,
        networkState: 'networkError'
      }));
      return;
    }

    // Reset estado al cambiar fuente
    setState(prev => ({
      ...prev,
      hasError: false,
      isLoading: true,
      networkState: 'loading',
      canPlay: false
    }));

    // Configurar atributos para streaming optimizado
    video.preload = 'metadata'; // Solo cargar metadatos inicialmente
    // No usar crossOrigin para archivos del mismo dominio
    // video.crossOrigin = 'anonymous';
    
    // Asignar la URL corregida y cargar el video
    video.src = fullUrl;
    video.load();
  }, [src]);

  // Auto-play cuando esté listo
  useEffect(() => {
    if (autoPlay && state.canPlay && !state.isPlaying) {
      const video = videoRef.current;
      video?.play().catch(error => {
        logger.warn('Auto-play failed:', error);
      });
    }
  }, [autoPlay, state.canPlay, state.isPlaying]);

  // Fullscreen event listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({ 
        ...prev, 
        isFullscreen: !!document.fullscreenElement 
      }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Verificar progreso cuando cambia el contador
  useEffect(() => {
    checkProgressCompletion();
  }, [checkProgressCompletion]);

  // Cleanup timeout y contador de tiempo
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (watchTimeIntervalRef.current) {
        clearInterval(watchTimeIntervalRef.current);
      }
    };
  }, []);

  // Calcular porcentajes para las barras
  const progressPercent = state.duration ? (state.currentTime / state.duration) * 100 : 0;
  const volumePercent = state.volume * 100;

  // Construir URL de poster si existe
  const posterUrl = poster ? buildMediaUrl(poster, undefined, undefined, 'images') : undefined;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${
        state.isFullscreen ? 'w-screen h-screen' : ''
      }`}
      style={{ width: state.isFullscreen ? '100vw' : width, height: state.isFullscreen ? '100vh' : height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={posterUrl}
        onClick={togglePlay}
        style={{ minHeight: '200px' }}
      />

      {/* Loading State */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm">Cargando video...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {state.hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center text-white p-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar el video</h3>
            <p className="text-sm text-gray-300 mb-4">
              No se pudo reproducir el video. Verifica la conexión e inténtalo de nuevo.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setState(prev => ({ ...prev, hasError: false }));
                const video = videoRef.current;
                if (video) video.load();
              }}
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Buffering Indicator */}
      {state.isBuffering && !state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 rounded-lg p-3">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!state.isPlaying && !state.isLoading && !state.hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-4 transition-all"
          >
            <Play className="w-12 h-12 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Video Title Overlay */}
      {(title || description) && showControls && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4">
          {title && (
            <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
          )}
          {description && (
            <p className="text-gray-300 text-sm line-clamp-2">{description}</p>
          )}
        </div>
      )}

      {/* Controls */}
      {showControls && state.canPlay && !state.hasError && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div 
              ref={progressRef}
              className="relative h-2 bg-gray-600 rounded-full cursor-pointer group"
              onMouseDown={handleProgressMouseDown}
            >
              {/* Buffer Progress */}
              <div 
                className="absolute top-0 left-0 h-full bg-gray-400 rounded-full transition-all duration-150"
                style={{ width: `${state.loadedPercent}%` }}
              />
              {/* Playback Progress */}
              <div 
                className="absolute top-0 left-0 h-full bg-primary-500 rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Handle */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progressPercent}% - 8px)` }}
              />
            </div>
            
            {/* Time Display */}
            <div className="flex justify-between text-xs text-gray-300 mt-2">
              <span>{formatTime(state.currentTime)}</span>
              <span>{formatTime(state.duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Skip Back */}
              <button
                onClick={() => skip(-10)}
                className="text-white hover:text-primary-400 p-1 transition-colors"
                disabled={!state.canPlay}
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 transition-colors"
                disabled={!state.canPlay}
              >
                {state.isBuffering ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : state.isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>

              {/* Skip Forward */}
              <button
                onClick={() => skip(10)}
                className="text-white hover:text-primary-400 p-1 transition-colors"
                disabled={!state.canPlay}
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-primary-400 p-1 transition-colors"
                >
                  {state.isMuted || state.volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                
                <div 
                  ref={volumeRef}
                  className="w-20 h-2 bg-gray-600 rounded-full cursor-pointer"
                  onMouseDown={handleVolumeMouseDown}
                >
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${volumePercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-primary-400 p-1 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-8 right-0 bg-black bg-opacity-90 rounded-lg p-3 min-w-32">
                    <div className="text-white text-sm space-y-2">
                      <div className="font-medium mb-2">Velocidad</div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-700 ${
                            state.playbackRate === rate ? 'bg-primary-600' : ''
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Download */}
              {showDownload && (
                <button
                  onClick={handleDownload}
                  className="text-white hover:text-primary-400 p-1 transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-primary-400 p-1 transition-colors"
              >
                {state.isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;