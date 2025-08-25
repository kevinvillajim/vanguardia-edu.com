/**
 * Configuración de Interfaz de Usuario y UX
 * 
 * Centraliza toda la configuración relacionada con:
 * - Temas y colores
 * - Animaciones y transiciones
 * - Tamaños y espaciados
 * - Configuración de componentes
 * - Responsive breakpoints
 */

export interface UiConfig {
  // Tema y colores
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  
  // Animaciones
  animations: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: {
      default: string;
      enter: string;
      exit: string;
    };
    disabled: boolean;
  };
  
  // Componentes específicos
  components: {
    modal: {
      backdropBlur: boolean;
      closeOnBackdrop: boolean;
      closeOnEscape: boolean;
      animation: string;
    };
    notification: {
      duration: number;
      position: string;
      maxVisible: number;
    };
    loader: {
      type: string;
      size: string;
      color: string;
    };
  };
  
  // Responsive
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  
  // Layout
  layout: {
    sidebarWidth: number;
    headerHeight: number;
    maxContentWidth: number;
    padding: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
    };
  };
}

/**
 * Configuración por defecto de UI
 */
export const DEFAULT_UI_CONFIG: UiConfig = {
  // 🎨 TEMA Y COLORES
  theme: {
    primary: '#3B82F6',    // Blue-500
    secondary: '#6B7280',  // Gray-500  
    accent: '#F59E0B',     // Amber-500
    success: '#10B981',    // Emerald-500
    warning: '#F59E0B',    // Amber-500
    error: '#EF4444',      // Red-500
    info: '#3B82F6',       // Blue-500
    background: '#FFFFFF', // White
    surface: '#F9FAFB',    // Gray-50
    text: {
      primary: '#111827',   // Gray-900
      secondary: '#6B7280', // Gray-500
      disabled: '#9CA3AF',  // Gray-400
    }
  },
  
  // 🎬 ANIMACIONES
  animations: {
    duration: {
      fast: 150,    // 150ms
      normal: 300,  // 300ms  
      slow: 500,    // 500ms
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-out
      enter: 'cubic-bezier(0, 0, 0.2, 1)',     // ease-out
      exit: 'cubic-bezier(0.4, 0, 1, 1)',      // ease-in
    },
    disabled: false, // Deshabilitar animaciones globalmente
  },
  
  // 🧩 COMPONENTES ESPECÍFICOS
  components: {
    modal: {
      backdropBlur: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
      animation: 'fade-scale',
    },
    notification: {
      duration: 5000,        // 5 segundos
      position: 'top-right', // top-left, top-right, bottom-left, bottom-right
      maxVisible: 5,         // Máximo 5 notificaciones visibles
    },
    loader: {
      type: 'spinner',   // spinner, dots, bars, pulse
      size: 'medium',    // small, medium, large
      color: 'primary',  // primary, secondary, accent
    }
  },
  
  // 📱 RESPONSIVE BREAKPOINTS
  breakpoints: {
    xs: 475,   // Teléfonos pequeños
    sm: 640,   // Teléfonos
    md: 768,   // Tabletas
    lg: 1024,  // Laptops
    xl: 1280,  // Desktops
    xxl: 1536, // Pantallas grandes
  },
  
  // 📐 LAYOUT
  layout: {
    sidebarWidth: 280,      // Ancho del sidebar en px
    headerHeight: 64,       // Alto del header en px
    maxContentWidth: 1200,  // Ancho máximo del contenido
    padding: {
      xs: 16,  // 16px - móviles
      sm: 24,  // 24px - tabletas
      md: 32,  // 32px - laptops
      lg: 48,  // 48px - desktops
    }
  }
};

/**
 * Temas preestablecidos
 */
export const UI_THEMES = {
  // Tema claro (por defecto)
  LIGHT: {
    ...DEFAULT_UI_CONFIG,
    theme: {
      ...DEFAULT_UI_CONFIG.theme,
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: {
        primary: '#111827',
        secondary: '#6B7280', 
        disabled: '#9CA3AF',
      }
    }
  },
  
  // Tema oscuro
  DARK: {
    ...DEFAULT_UI_CONFIG,
    theme: {
      ...DEFAULT_UI_CONFIG.theme,
      background: '#111827', // Gray-900
      surface: '#1F2937',    // Gray-800
      text: {
        primary: '#F9FAFB',   // Gray-50
        secondary: '#D1D5DB', // Gray-300
        disabled: '#6B7280',  // Gray-500
      }
    }
  },
  
  // Tema educativo (colores más suaves)
  EDUCATIONAL: {
    ...DEFAULT_UI_CONFIG,
    theme: {
      ...DEFAULT_UI_CONFIG.theme,
      primary: '#6366F1',    // Indigo-500
      secondary: '#8B5CF6',  // Violet-500
      accent: '#06B6D4',     // Cyan-500
      background: '#FEFEFE',
      surface: '#F8FAFC',    // Slate-50
    }
  }
};

/**
 * Presets de animación
 */
export const ANIMATION_PRESETS = {
  // Sin animaciones (para accesibilidad o rendimiento)
  NONE: {
    ...DEFAULT_UI_CONFIG.animations,
    disabled: true,
    duration: { fast: 0, normal: 0, slow: 0 }
  },
  
  // Animaciones rápidas
  FAST: {
    ...DEFAULT_UI_CONFIG.animations,
    duration: { fast: 100, normal: 200, slow: 300 }
  },
  
  // Animaciones lentas (para presentaciones)
  SLOW: {
    ...DEFAULT_UI_CONFIG.animations,
    duration: { fast: 300, normal: 500, slow: 800 }
  }
};

/**
 * Configuraciones responsive preestablecidas
 */
export const LAYOUT_PRESETS = {
  // Diseño compacto (para pantallas pequeñas)
  COMPACT: {
    ...DEFAULT_UI_CONFIG.layout,
    sidebarWidth: 240,
    headerHeight: 56,
    padding: { xs: 12, sm: 16, md: 24, lg: 32 }
  },
  
  // Diseño espacioso (para pantallas grandes)  
  SPACIOUS: {
    ...DEFAULT_UI_CONFIG.layout,
    sidebarWidth: 320,
    headerHeight: 72,
    maxContentWidth: 1400,
    padding: { xs: 24, sm: 32, md: 48, lg: 64 }
  }
};

/**
 * Obtener configuración de UI según preferencias
 */
export function getUiConfig(
  theme?: keyof typeof UI_THEMES,
  animations?: keyof typeof ANIMATION_PRESETS,
  layout?: keyof typeof LAYOUT_PRESETS
): UiConfig {
  let config = { ...DEFAULT_UI_CONFIG };
  
  // Aplicar tema
  if (theme && UI_THEMES[theme]) {
    config = { ...config, ...UI_THEMES[theme] };
  }
  
  // Aplicar preset de animaciones
  if (animations && ANIMATION_PRESETS[animations]) {
    config.animations = { ...config.animations, ...ANIMATION_PRESETS[animations] };
  }
  
  // Aplicar preset de layout
  if (layout && LAYOUT_PRESETS[layout]) {
    config.layout = { ...config.layout, ...LAYOUT_PRESETS[layout] };
  }
  
  return config;
}

/**
 * Generar clases CSS para breakpoints
 */
export function generateBreakpointClasses(config: UiConfig = DEFAULT_UI_CONFIG): string {
  const { breakpoints } = config;
  
  return Object.entries(breakpoints)
    .map(([key, value]) => `--breakpoint-${key}: ${value}px;`)
    .join('\n');
}

/**
 * Verificar si se debe mostrar animaciones (accesibilidad)
 */
export function shouldShowAnimations(config: UiConfig = DEFAULT_UI_CONFIG): boolean {
  // Verificar preferencias de usuario del sistema
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return !config.animations.disabled && !prefersReducedMotion;
}

/**
 * Obtener configuración específica de un componente
 */
export function getComponentConfig<T extends keyof UiConfig['components']>(
  component: T, 
  config: UiConfig = DEFAULT_UI_CONFIG
): UiConfig['components'][T] {
  return config.components[component];
}

export default DEFAULT_UI_CONFIG;