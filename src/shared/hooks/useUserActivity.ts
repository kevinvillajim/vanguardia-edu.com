import { useEffect, useCallback, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { userActivityService } from '../../services/userActivityService';
import { ActivityConfig } from '../../config';
import { logger } from '../utils/logger';

interface UseUserActivityOptions {
  /** Configuración personalizada para el monitoreo */
  customConfig?: Partial<ActivityConfig>;
  /** Si debe iniciar automáticamente el monitoreo */
  autoStart?: boolean;
  /** Intervalo para actualizar estadísticas (ms) */
  statsUpdateInterval?: number;
}

interface UserActivityStats {
  lastActivity: string;
  lastFocus: string;
  isActive: boolean;
  isWindowFocused: boolean;
  isListening: boolean;
  config: {
    inactivityTimeout: string;
    refreshBuffer: string;
    focusGracePeriod: string;
  };
}

/**
 * Hook para gestionar la actividad del usuario y renovación inteligente de tokens
 */
export function useUserActivity(options: UseUserActivityOptions = {}) {
  const { customConfig, autoStart = true, statsUpdateInterval = 10000 } = options;
  const { user, isAuthenticated } = useAuthStore();
  
  const [stats, setStats] = useState<UserActivityStats | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Función para iniciar el monitoreo
  const startMonitoring = useCallback(() => {
    if (!isAuthenticated || isMonitoring) return;
    
    const userRole = getUserRole(user?.role);
    logger.info('🎯 useUserActivity: Iniciando monitoreo para rol:', userRole);
    
    userActivityService.startMonitoring(userRole, customConfig);
    setIsMonitoring(true);
  }, [isAuthenticated, isMonitoring, user?.role, customConfig]);

  // Función para detener el monitoreo
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;
    
    logger.info('🛑 useUserActivity: Deteniendo monitoreo');
    userActivityService.stopMonitoring();
    setIsMonitoring(false);
    setStats(null);
  }, [isMonitoring]);

  // Función para registrar actividad manual
  const recordActivity = useCallback(() => {
    userActivityService.recordActivity();
  }, []);

  // Función para obtener estadísticas actuales
  const getStats = useCallback(() => {
    if (!isMonitoring) return null;
    return userActivityService.getActivityStats();
  }, [isMonitoring]);

  // Iniciar/detener monitoreo basado en autenticación
  useEffect(() => {
    if (isAuthenticated && autoStart) {
      startMonitoring();
    } else if (!isAuthenticated && isMonitoring) {
      stopMonitoring();
    }
  }, [isAuthenticated, autoStart, startMonitoring, stopMonitoring, isMonitoring]);

  // Actualizar estadísticas periódicamente
  useEffect(() => {
    if (!isMonitoring || !statsUpdateInterval) return;

    const updateStats = () => {
      const currentStats = getStats();
      if (currentStats) {
        setStats(currentStats);
      }
    };

    // Actualizar inmediatamente
    updateStats();

    // Configurar intervalo
    const interval = setInterval(updateStats, statsUpdateInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, statsUpdateInterval, getStats]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [isMonitoring, stopMonitoring]);

  return {
    // Estado
    isMonitoring,
    stats,
    isActive: stats?.isActive ?? false,
    
    // Acciones
    startMonitoring,
    stopMonitoring,
    recordActivity,
    getStats,
    
    // Utilidades
    formatTime: (ms: number) => {
      const minutes = Math.floor(ms / (60 * 1000));
      const seconds = Math.floor((ms % (60 * 1000)) / 1000);
      return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    }
  };
}

/**
 * Convertir rol de usuario a string para configuración
 */
function getUserRole(userRole?: number): string {
  switch (userRole) {
    case 1: return 'admin';
    case 2: return 'student'; 
    case 3: return 'teacher';
    default: return 'student';
  }
}

/**
 * Hook simplificado para componentes que solo necesitan registrar actividad
 */
export function useActivityRecorder() {
  const recordActivity = useCallback(() => {
    userActivityService.recordActivity();
  }, []);

  return { recordActivity };
}

/**
 * Hook para mostrar indicadores de actividad en desarrollo
 */
export function useActivityDebugger(enabled: boolean = false) {
  const { stats, isMonitoring } = useUserActivity({
    autoStart: enabled,
    statsUpdateInterval: 2000 // Actualizar cada 2 segundos para debug
  });

  // Solo retornar datos si está habilitado
  if (!enabled) {
    return { 
      debugInfo: null,
      isDebugging: false 
    };
  }

  return {
    debugInfo: stats ? {
      ...stats,
      monitoring: isMonitoring,
      timestamp: new Date().toLocaleTimeString()
    } : null,
    isDebugging: enabled && isMonitoring
  };
}

export default useUserActivity;