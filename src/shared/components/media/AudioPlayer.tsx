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
  Wifi,
  WifiOff,
  Signal,
  AlertCircle
} from 'lucide-react';
import Button from '../../../components/ui/Button/Button';
import { useAudioStreaming } from '../../hooks/useAudioStreaming';
import { buildMediaUrl } from '../../utils/mediaUtils';
import { getMediaCompletionPercentage } from '../../../config';

interface AudioPlayerProps {
  /** URL del archivo de audio */
  src: string;
  /** Título del audio (opcional) */
  title?: string;
  /** Descripción del audio (opcional) */
  description?: string;
  /** Auto reproducir al cargar */
  autoPlay?: boolean;
  /** Mostrar controles de descarga */
  showDownload?: boolean;
  /** Estilo del reproductor */
  variant?: 'default' | 'compact' | 'minimal';
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
  /** Callback cuando se completa el 95% del audio */
  onProgress95?: () => void;
}

interface AudioState {
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
  networkState: 'loading' | 'idle' | 'noSource' | 'networkError';
  playbackRate: number;     // Velocidad de reproducción
  watchTimeCounter: number; // Contador interno de tiempo visto
  hasReached95: boolean;    // Si ya alcanzó el 95%
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  description,
  autoPlay = false,
  showDownload = false,
  variant = 'default',
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const streamingInitialized = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const watchTimeIntervalRef = useRef<NodeJS.Timeout>();
  const lastUpdateTimeRef = useRef<number>(0);
  
  const [state, setState] = useState<AudioState>({
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
    networkState: 'loading',
    playbackRate: 1,
    watchTimeCounter: 0,
    hasReached95: false
  });

  // Hook de streaming inteligente (temporalmente deshabilitado para debug)
  const streaming = {
    isStreaming: false,
    bufferHealth: 0,
    connectionQuality: 'excellent' as const,
    estimatedBitrate: 0,
    bytesLoaded: 0,
    totalBytes: 0,
    retryCount: 0,
    adaptiveQuality: false,
    startStreaming: () => console.log('🔄 Streaming deshabilitado temporalmente'),
    stopStreaming: () => console.log('⏹️ Streaming deshabilitado temporalmente'),
    adjustQuality: () => {},
    getStreamingStats: () => ({
      isStreaming: false,
      bufferHealth: 0,
      connectionQuality: 'excellent' as const,
      estimatedBitrate: 0,
      bytesLoaded: 0,
      totalBytes: 0,
      retryCount: 0,
      adaptiveQuality: false
    }),
    forceRetry: () => {}
  };

  // const streaming = useAudioStreaming(audioRef.current, {
  //   initialBuffer: 5,
  //   minBuffer: 2,
  //   maxRetries: 3,
  //   retryDelay: 1000,
  //   preloadMetadata: true
  // });

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
    const configPercentage = getMediaCompletionPercentage('audio') / 100; // Convertir a decimal
    
    // Calcular tiempo ajustado por velocidad: tiempo_real / velocidad_reproduccion
    const adjustedDuration = state.duration / state.playbackRate;
    const requiredTime = adjustedDuration * configPercentage;
    
    if (state.watchTimeCounter >= requiredTime) {
      setState(prev => ({ ...prev, hasReached95: true }));
      
      console.log(`🎵 Audio ${Math.round(configPercentage * 100)}% completed`, {
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

  // Handlers de eventos de audio
  const handleLoadStart = useCallback(() => {
    console.log('🔄 AudioPlayer: Load start');
    setState(prev => ({ ...prev, isLoading: true, networkState: 'loading' }));
  }, []);

  const handleCanPlay = useCallback(() => {
    console.log('✅ AudioPlayer: Audio can play');
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

  const handleDurationChange = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setState(prev => ({ ...prev, duration: audio.duration || 0 }));
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isDragging) return;

    const currentTime = audio.currentTime;
    const duration = audio.duration || 0;
    
    setState(prev => ({ ...prev, currentTime }));
    onTimeUpdate?.(currentTime, duration);
  }, [isDragging, onTimeUpdate]);

  const handleProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const buffered = audio.buffered;
    const duration = audio.duration || 0;
    
    if (buffered.length > 0 && duration > 0) {
      const loadedPercent = (buffered.end(buffered.length - 1) / duration) * 100;
      setState(prev => ({ ...prev, loadedPercent }));
      onLoadProgress?.(buffered.end(buffered.length - 1), duration);
    }
  }, [onLoadProgress]);

  const handleWaiting = useCallback(() => {
    setState(prev => ({ ...prev, isBuffering: true }));
  }, []);

  const handlePlaying = useCallback(() => {
    setState(prev => ({ ...prev, isBuffering: false, isPlaying: true }));
    startWatchTimeCounter(); // Iniciar contador cuando reproduce
    onPlay?.();
  }, [onPlay, startWatchTimeCounter]);

  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    stopWatchTimeCounter(); // Detener contador cuando pausa
    onPause?.();
  }, [onPause, stopWatchTimeCounter]);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    stopWatchTimeCounter(); // Detener contador cuando termina
    onEnded?.();
  }, [onEnded, stopWatchTimeCounter]);

  const handleError = useCallback((e?: Event) => {
    const audio = audioRef.current;
    let errorDetails = 'Error desconocido';
    let errorCode = 'UNKNOWN';
    
    if (audio && audio.error) {
      switch (audio.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorDetails = 'Reproducción abortada por el usuario';
          errorCode = 'ABORTED';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorDetails = 'Error de red durante la descarga';
          errorCode = 'NETWORK';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorDetails = 'Error al decodificar el archivo de audio';
          errorCode = 'DECODE';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorDetails = 'Formato de audio no soportado';
          errorCode = 'FORMAT';
          break;
        default:
          errorDetails = 'Error al cargar el audio';
          errorCode = 'LOAD';
      }
    }
    
    console.error('🚫 AudioPlayer Error:', {
      code: errorCode,
      details: errorDetails,
      src: src,
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
    const audio = audioRef.current;
    if (!audio) return;
    
    setState(prev => ({ 
      ...prev, 
      volume: audio.volume,
      isMuted: audio.muted 
    }));
  }, []);

  // Controles de reproducción
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  }, [state.isPlaying]);

  const seek = useCallback((percent: number) => {
    const audio = audioRef.current;
    if (!audio || !state.duration) return;

    const newTime = (percent / 100) * state.duration;
    audio.currentTime = newTime;
    setState(prev => ({ ...prev, currentTime: newTime }));
  }, [state.duration]);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(state.duration, state.currentTime + seconds));
    audio.currentTime = newTime;
  }, [state.currentTime, state.duration]);

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = Math.max(0, Math.min(1, volume));
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
  }, []);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = buildMediaUrl(src, undefined, undefined, 'audio');
    link.download = title || 'audio';
    link.click();
  }, [src, title]);

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
    const audio = audioRef.current;
    if (!audio) return;

    // Event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [
    handleLoadStart, handleCanPlay, handleCanPlayThrough,
    handleDurationChange, handleTimeUpdate, handleProgress,
    handleWaiting, handlePlaying, handlePause, handleEnded,
    handleError, handleVolumeChange
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

  // Inicializar audio cuando esté listo
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    console.log('🎵 AudioPlayer: Inicializando con src:', src);

    // Construir URL correcta usando el helper para archivos de audio
    const fullUrl = buildMediaUrl(src, undefined, undefined, 'audio');
    console.log('🎵 AudioPlayer: URL construida:', fullUrl);

    // Validar que la URL sea válida
    try {
      new URL(fullUrl);
    } catch (error) {
      console.error('🚫 AudioPlayer: URL inválida:', fullUrl, error);
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

    // Asignar la URL corregida y cargar el audio
    audio.src = fullUrl;
    audio.load();
  }, [src]);

  // Inicializar streaming cuando el audio esté disponible
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && src && state.canPlay && !streamingInitialized.current) {
      console.log('🔄 AudioPlayer: Iniciando streaming');
      try {
        streamingInitialized.current = true;
        streaming.startStreaming();
      } catch (error) {
        console.warn('⚠️ AudioPlayer: Error iniciando streaming, continuando sin él', error);
      }
    }

    return () => {
      if (streamingInitialized.current) {
        try {
          streaming.stopStreaming();
        } catch (error) {
          console.warn('⚠️ AudioPlayer: Error deteniendo streaming', error);
        }
        streamingInitialized.current = false;
      }
    };
  }, [src, state.canPlay]);

  // Auto-play cuando esté listo
  useEffect(() => {
    if (autoPlay && state.canPlay && !state.isPlaying) {
      const audio = audioRef.current;
      audio?.play().catch(console.error);
    }
  }, [autoPlay, state.canPlay, state.isPlaying]);

  // Verificar progreso cuando cambia el contador
  useEffect(() => {
    checkProgressCompletion();
  }, [checkProgressCompletion]);

  // Cleanup contador de tiempo
  useEffect(() => {
    return () => {
      if (watchTimeIntervalRef.current) {
        clearInterval(watchTimeIntervalRef.current);
      }
    };
  }, []);

  // Calcular porcentajes para las barras
  const progressPercent = state.duration ? (state.currentTime / state.duration) * 100 : 0;
  const volumePercent = state.volume * 100;

  // Renderizar según variant
  const renderCompactPlayer = () => (
    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlay}
        disabled={!state.canPlay || state.hasError}
        className="flex-shrink-0"
      >
        {state.isBuffering ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : state.isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>

      <div className="flex-1 min-w-0">
        <div 
          ref={progressRef}
          className="relative h-2 bg-gray-200 rounded-full cursor-pointer group"
          onMouseDown={handleProgressMouseDown}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-gray-300 rounded-full"
            style={{ width: `${state.loadedPercent}%` }}
          />
          <div 
            className="absolute top-0 left-0 h-full bg-primary-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <span className="text-xs text-gray-500 flex-shrink-0 min-w-0">
        {formatTime(state.currentTime)} / {formatTime(state.duration)}
      </span>
    </div>
  );

  const renderMinimalPlayer = () => (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlay}
        disabled={!state.canPlay || state.hasError}
      >
        {state.isBuffering ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : state.isPlaying ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </Button>
      
      <div className="text-xs text-gray-500">
        {formatTime(state.currentTime)}
      </div>
    </div>
  );

  const renderDefaultPlayer = () => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      {(title || description) && (
        <div className="p-4 border-b border-gray-100">
          {title && (
            <h4 className="font-medium text-gray-900 truncate">{title}</h4>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
          )}
        </div>
      )}

      {/* Player Controls */}
      <div className="p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div 
            ref={progressRef}
            className="relative h-2 bg-gray-200 rounded-full cursor-pointer group"
            onMouseDown={handleProgressMouseDown}
          >
            {/* Buffer Progress */}
            <div 
              className="absolute top-0 left-0 h-full bg-gray-300 rounded-full transition-all duration-150"
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
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Skip Back */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(-10)}
              disabled={!state.canPlay}
              className="text-gray-600"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            {/* Play/Pause */}
            <Button
              variant="primary"
              size="sm"
              onClick={togglePlay}
              disabled={!state.canPlay || state.hasError}
              className="px-4"
            >
              {state.isBuffering ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : state.isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>

            {/* Skip Forward */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skip(10)}
              disabled={!state.canPlay}
              className="text-gray-600"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume & Additional Controls */}
          <div className="flex items-center space-x-3">
            {/* Network State & Streaming Info */}
            <div className="flex items-center space-x-1">
              {streaming.connectionQuality === 'excellent' && (
                <Signal className="w-4 h-4 text-green-500" />
              )}
              {streaming.connectionQuality === 'good' && (
                <Signal className="w-4 h-4 text-yellow-500" />
              )}
              {streaming.connectionQuality === 'poor' && (
                <Signal className="w-4 h-4 text-orange-500" />
              )}
              {streaming.connectionQuality === 'offline' && (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              {state.isBuffering && (
                <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
              )}
              {streaming.bufferHealth < 30 && streaming.bufferHealth > 0 && (
                <AlertCircle className="w-4 h-4 text-orange-500" title={`Buffer: ${Math.round(streaming.bufferHealth)}%`} />
              )}
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-gray-600"
              >
                {state.isMuted || state.volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              
              <div 
                ref={volumeRef}
                className="w-16 h-2 bg-gray-200 rounded-full cursor-pointer"
                onMouseDown={handleVolumeMouseDown}
              >
                <div 
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${volumePercent}%` }}
                />
              </div>
            </div>

            {/* Download */}
            {showDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-gray-600"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Error State */}
        {state.hasError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              Error al cargar el audio. Verifica la conexión e inténtalo de nuevo.
            </p>
            {streaming.retryCount > 0 && (
              <p className="text-xs text-red-500 mt-1">
                Reintentos: {streaming.retryCount}
              </p>
            )}
          </div>
        )}

        {/* Streaming Info (Debug) */}
        {import.meta.env.MODE === 'development' && streaming.isStreaming && (
          <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <div>Buffer: {Math.round(streaming.bufferHealth)}%</div>
              <div>Conexión: {streaming.connectionQuality}</div>
              <div>Bitrate: {Math.round(streaming.estimatedBitrate / 1000)}k</div>
              <div>Cargado: {Math.round((streaming.bytesLoaded / streaming.totalBytes) * 100) || 0}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="metadata"
        className="hidden"
      />
    </div>
  );

  // Render según variant
  switch (variant) {
    case 'compact':
      return renderCompactPlayer();
    case 'minimal':
      return renderMinimalPlayer();
    default:
      return renderDefaultPlayer();
  }
};

export default AudioPlayer;