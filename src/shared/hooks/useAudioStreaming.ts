import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { logger } from '../utils/logger';

interface StreamingOptions {
  /** Tamaño del buffer inicial en segundos */
  initialBuffer?: number;
  /** Tamaño mínimo del buffer para mantener reproducción */
  minBuffer?: number;
  /** Reintentos automáticos en caso de error */
  maxRetries?: number;
  /** Delay entre reintentos en ms */
  retryDelay?: number;
  /** Precargar metadata */
  preloadMetadata?: boolean;
}

interface StreamingState {
  isStreaming: boolean;
  bufferHealth: number; // 0-100, porcentaje de buffer saludable
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  estimatedBitrate: number;
  bytesLoaded: number;
  totalBytes: number;
  retryCount: number;
  adaptiveQuality: boolean;
}

interface UseAudioStreamingReturn extends StreamingState {
  startStreaming: () => void;
  stopStreaming: () => void;
  adjustQuality: (quality: 'high' | 'medium' | 'low' | 'auto') => void;
  getStreamingStats: () => StreamingState;
  forceRetry: () => void;
}

export const useAudioStreaming = (
  audioElement: HTMLAudioElement | null,
  options: StreamingOptions = {}
): UseAudioStreamingReturn => {
  const {
    initialBuffer = 5,
    minBuffer = 2,
    maxRetries = 3,
    retryDelay = 1000,
    preloadMetadata = true
  } = options;

  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    bufferHealth: 0,
    connectionQuality: 'excellent',
    estimatedBitrate: 0,
    bytesLoaded: 0,
    totalBytes: 0,
    retryCount: 0,
    adaptiveQuality: true
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const statsIntervalRef = useRef<NodeJS.Timeout>();
  const lastProgressTime = useRef<number>(0);
  const lastBytesLoaded = useRef<number>(0);

  // Calcular calidad de conexión basada en velocidad de descarga
  const calculateConnectionQuality = useCallback((bitrate: number) => {
    if (bitrate > 1000000) return 'excellent'; // > 1 Mbps
    if (bitrate > 500000) return 'good';       // > 500 kbps
    if (bitrate > 128000) return 'poor';       // > 128 kbps
    return 'offline';
  }, []);

  // Calcular salud del buffer
  const calculateBufferHealth = useCallback(() => {
    if (!audioElement || !audioElement.buffered.length) return 0;

    const currentTime = audioElement.currentTime;
    const buffered = audioElement.buffered;
    
    // Encontrar el rango de buffer que contiene el tiempo actual
    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i);
      
      if (currentTime >= start && currentTime <= end) {
        const bufferAhead = end - currentTime;
        const healthPercent = Math.min(100, (bufferAhead / minBuffer) * 100);
        return healthPercent;
      }
    }
    
    return 0;
  }, [audioElement, minBuffer]);

  // Manejar progreso de carga
  const handleProgress = useCallback(() => {
    if (!audioElement) return;

    const now = Date.now();
    const buffered = audioElement.buffered;
    
    if (buffered.length > 0) {
      const loaded = buffered.end(buffered.length - 1);
      const duration = audioElement.duration || 0;
      const bytesLoaded = loaded * 1000; // Estimación
      const totalBytes = duration * 1000; // Estimación

      // Calcular bitrate si tenemos datos temporales
      let estimatedBitrate = 0;
      if (lastProgressTime.current && now - lastProgressTime.current > 1000) {
        const timeDiff = (now - lastProgressTime.current) / 1000;
        const bytesDiff = bytesLoaded - lastBytesLoaded.current;
        estimatedBitrate = Math.round((bytesDiff * 8) / timeDiff); // bits por segundo
        
        lastProgressTime.current = now;
        lastBytesLoaded.current = bytesLoaded;
      } else if (!lastProgressTime.current) {
        lastProgressTime.current = now;
        lastBytesLoaded.current = bytesLoaded;
        return; // No actualizar el estado en la primera medición
      }

      const connectionQuality = calculateConnectionQuality(estimatedBitrate);
      const bufferHealth = calculateBufferHealth();

      // Solo actualizar si hay cambios significativos
      setState(prev => {
        const shouldUpdate = 
          Math.abs(prev.bufferHealth - bufferHealth) > 5 ||
          prev.connectionQuality !== connectionQuality ||
          Math.abs(prev.estimatedBitrate - estimatedBitrate) > 50000 ||
          Math.abs(prev.bytesLoaded - bytesLoaded) > 10000;

        if (!shouldUpdate) return prev;

        return {
          ...prev,
          bufferHealth,
          connectionQuality,
          estimatedBitrate,
          bytesLoaded,
          totalBytes
        };
      });
    }
  }, [audioElement, calculateConnectionQuality, calculateBufferHealth]);

  // Manejar espera por buffer (buffering)
  const handleWaiting = useCallback(() => {
    setState(prev => ({ ...prev, bufferHealth: 0 }));
  }, []);

  // Manejar cuando puede reproducir
  const handleCanPlay = useCallback(() => {
    setState(prev => ({ ...prev, bufferHealth: 100 }));
  }, []);

  // Manejar errores de red
  const handleError = useCallback(() => {
    if (state.retryCount < maxRetries) {
      setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
      
      // Retry con backoff exponencial
      const delay = retryDelay * Math.pow(2, state.retryCount);
      retryTimeoutRef.current = setTimeout(() => {
        audioElement?.load();
      }, delay);
    } else {
      setState(prev => ({ 
        ...prev, 
        connectionQuality: 'offline',
        isStreaming: false 
      }));
    }
  }, [audioElement, state.retryCount, maxRetries, retryDelay]);

  // Iniciar streaming
  const startStreaming = useCallback(() => {
    if (!audioElement) return;

    setState(prev => ({ ...prev, isStreaming: true, retryCount: 0 }));

    // Configurar preload para optimizar streaming
    if (preloadMetadata) {
      audioElement.preload = 'metadata';
    }

    // Limpiar listeners anteriores para evitar duplicados
    audioElement.removeEventListener('progress', handleProgress);
    audioElement.removeEventListener('waiting', handleWaiting);
    audioElement.removeEventListener('canplay', handleCanPlay);
    audioElement.removeEventListener('error', handleError);

    // Agregar event listeners
    audioElement.addEventListener('progress', handleProgress);
    audioElement.addEventListener('waiting', handleWaiting);
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('error', handleError);

    // Iniciar monitoreo de estadísticas menos frecuente
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }
    statsIntervalRef.current = setInterval(() => {
      if (audioElement && !audioElement.paused) {
        handleProgress();
      }
    }, 2000); // Menos frecuente para evitar bucles
  }, [audioElement, preloadMetadata, handleProgress, handleWaiting, handleCanPlay, handleError]);

  // Detener streaming
  const stopStreaming = useCallback(() => {
    setState(prev => ({ ...prev, isStreaming: false }));
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    if (audioElement) {
      audioElement.removeEventListener('progress', handleProgress);
      audioElement.removeEventListener('waiting', handleWaiting);
      audioElement.removeEventListener('canplay', handleCanPlay);
      audioElement.removeEventListener('error', handleError);
    }
  }, [audioElement, handleProgress, handleWaiting, handleCanPlay, handleError]);

  // Ajustar calidad adaptativamente
  const adjustQuality = useCallback((quality: 'high' | 'medium' | 'low' | 'auto') => {
    if (!audioElement) return;

    const currentTime = audioElement.currentTime;
    const wasPlaying = !audioElement.paused;

    switch (quality) {
      case 'auto':
        setState(prev => ({ ...prev, adaptiveQuality: true }));
        // La lógica adaptativa se maneja en el efecto
        break;
      case 'high':
        setState(prev => ({ ...prev, adaptiveQuality: false }));
        // Implementar configuración de alta calidad si la API lo soporta
        break;
      case 'medium':
        setState(prev => ({ ...prev, adaptiveQuality: false }));
        // Implementar configuración de calidad media
        break;
      case 'low':
        setState(prev => ({ ...prev, adaptiveQuality: false }));
        // Implementar configuración de baja calidad
        break;
    }

    // Restaurar posición y estado de reproducción
    audioElement.currentTime = currentTime;
    if (wasPlaying) {
      audioElement.play().catch(console.error);
    }
  }, [audioElement]);

  // Forzar reintento
  const forceRetry = useCallback(() => {
    setState(prev => ({ ...prev, retryCount: 0 }));
    audioElement?.load();
  }, [audioElement]);

  // Obtener estadísticas actuales
  const getStreamingStats = useCallback((): StreamingState => {
    return { ...state };
  }, [state]);

  // Lógica de calidad adaptativa
  useEffect(() => {
    if (!state.adaptiveQuality || !state.isStreaming) return;

    // Reducir calidad si la conexión es pobre
    if (state.connectionQuality === 'poor' && state.bufferHealth < 30) {
      logger.streaming('🔄 Reduciendo calidad por conexión pobre');
    }
    
    // Aumentar calidad si la conexión mejora
    if (state.connectionQuality === 'excellent' && state.bufferHealth > 80) {
      logger.streaming('📈 Aumentando calidad por buena conexión');
    }
  }, [state.connectionQuality, state.bufferHealth, state.adaptiveQuality, state.isStreaming]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    ...state,
    startStreaming,
    stopStreaming,
    adjustQuality,
    getStreamingStats,
    forceRetry
  };
};

export default useAudioStreaming;