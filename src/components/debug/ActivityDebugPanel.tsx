import React, { useState } from 'react';
import { Activity, Clock, Eye, EyeOff, Shield, Zap, Settings } from 'lucide-react';
import { useActivityDebugger } from '../../shared/hooks/useUserActivity';
import { useAuthStore } from '../../shared/store/authStore';

interface ActivityDebugPanelProps {
  /** Si mostrar el panel por defecto */
  defaultVisible?: boolean;
  /** Posición del panel */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Panel de debug para monitorear la actividad del usuario y el estado de los tokens
 * Solo se muestra en desarrollo o cuando se habilita explícitamente
 */
export const ActivityDebugPanel: React.FC<ActivityDebugPanelProps> = ({
  defaultVisible = false,
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(defaultVisible);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  
  // Solo habilitar en desarrollo o si está autenticado
  const shouldShow = process.env.NODE_ENV === 'development' || isAuthenticated;
  
  const { debugInfo, isDebugging } = useActivityDebugger(shouldShow && isVisible);

  if (!shouldShow) return null;

  const positionStyles = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4', 
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-500' : 'text-red-500';
  };

  const getRoleIcon = (role?: number) => {
    switch (role) {
      case 1: return '👑'; // Admin
      case 2: return '🎓'; // Student  
      case 3: return '👨‍🏫'; // Teacher
      default: return '👤';
    }
  };

  if (!isVisible) {
    // Toggle button cuando está oculto
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed ${positionStyles[position]} z-50 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all`}
        title="Mostrar panel de actividad"
      >
        <Activity className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className={`fixed ${positionStyles[position]} z-50 font-mono text-xs`}>
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-600 max-w-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="font-semibold">Activity Monitor</span>
            {isDebugging && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title={isCollapsed ? 'Expandir' : 'Colapsar'}
            >
              {isCollapsed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400"
              title="Ocultar panel"
            >
              ✕
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="p-3 space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-2 text-gray-300">
              <span className="text-lg">{getRoleIcon(user?.role)}</span>
              <span>{user?.name || 'Usuario'}</span>
              <span className="text-gray-500">#{user?.role || 'N/A'}</span>
            </div>

            {/* Monitoring Status */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Monitoreo:</span>
                <span className={getStatusColor(isDebugging)}>
                  {isDebugging ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              {debugInfo && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Estado:</span>
                    <span className={getStatusColor(debugInfo.isActive)}>
                      {debugInfo.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Ventana:</span>
                    <span className={getStatusColor(debugInfo.isWindowFocused)}>
                      {debugInfo.isWindowFocused ? 'Enfocada' : 'Sin foco'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Activity Times */}
            {debugInfo && (
              <div className="space-y-1 border-t border-gray-700 pt-2">
                <div className="flex items-center gap-1 text-gray-400 mb-1">
                  <Clock className="w-3 h-3" />
                  <span>Tiempos:</span>
                </div>
                
                <div className="ml-4 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Última actividad:</span>
                    <span className="text-yellow-400">{debugInfo.lastActivity}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Último foco:</span>
                    <span className="text-blue-400">{debugInfo.lastFocus}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Configuration */}
            {debugInfo && (
              <div className="space-y-1 border-t border-gray-700 pt-2">
                <div className="flex items-center gap-1 text-gray-400 mb-1">
                  <Settings className="w-3 h-3" />
                  <span>Configuración:</span>
                </div>
                
                <div className="ml-4 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Inactividad:</span>
                    <span className="text-orange-400">{debugInfo.config.inactivityTimeout}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Renovación:</span>
                    <span className="text-purple-400">{debugInfo.config.refreshBuffer}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gracia:</span>
                    <span className="text-cyan-400">{debugInfo.config.focusGracePeriod}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Token Info */}
            {isAuthenticated && (
              <div className="space-y-1 border-t border-gray-700 pt-2">
                <div className="flex items-center gap-1 text-gray-400 mb-1">
                  <Shield className="w-3 h-3" />
                  <span>Token:</span>
                </div>
                
                <div className="ml-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estado:</span>
                    <span className="text-green-400">Válido</span>
                  </div>
                </div>
              </div>
            )}

            {/* Real-time timestamp */}
            {debugInfo && (
              <div className="text-center text-gray-500 text-[10px] border-t border-gray-700 pt-2">
                Actualizado: {debugInfo.timestamp}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-1 border-t border-gray-700 pt-2">
              <button
                onClick={() => {
                  console.log('🔄 Manual activity trigger');
                  // Trigger manual activity record if needed
                }}
                className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                title="Registrar actividad manual"
              >
                <Zap className="w-3 h-3 mx-auto" />
              </button>
              
              <button
                onClick={() => {
                  console.clear();
                  console.log('🧹 Console cleared');
                }}
                className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
                title="Limpiar consola"
              >
                🧹
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityDebugPanel;