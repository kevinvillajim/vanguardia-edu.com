/**
 * Componente para mostrar mensajes de validación
 * Integrado con el sistema de validación centralizado
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { withMemoization } from '../../performance/MemoizationUtils';

export type ValidationMessageType = 'error' | 'warning' | 'success' | 'info';

export interface ValidationMessageProps {
  type: ValidationMessageType;
  message: string;
  className?: string;
  showIcon?: boolean;
}

export interface FieldValidationProps {
  errors?: string[];
  className?: string;
  showIcon?: boolean;
}

const iconMap = {
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info
};

const styleMap = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-600',
    text: 'text-red-700'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: 'text-yellow-600',
    text: 'text-yellow-700'
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: 'text-green-600',
    text: 'text-green-700'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-600',
    text: 'text-blue-700'
  }
};

/**
 * Componente individual de mensaje de validación - Optimizado
 */
const ValidationMessageComponent: React.FC<ValidationMessageProps> = ({
  type,
  message,
  className = '',
  showIcon = true
}) => {
  const Icon = iconMap[type];
  const styles = styleMap[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`
        flex items-start gap-2 p-3 rounded-lg border
        ${styles.container}
        ${className}
      `}
    >
      {showIcon && (
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${styles.icon}`} />
      )}
      <span className={`text-sm ${styles.text}`}>
        {message}
      </span>
    </motion.div>
  );
};

/**
 * Componente para mostrar errores de validación de un campo - Optimizado
 */
const FieldValidationComponent: React.FC<FieldValidationProps> = ({
  errors = [],
  className = '',
  showIcon = true
}) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className={`mt-1 space-y-1 ${className}`}>
      <AnimatePresence mode="popLayout">
        {errors.map((error, index) => (
          <ValidationMessage
            key={`${error}-${index}`}
            type="error"
            message={error}
            showIcon={showIcon}
            className="text-xs py-2"
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Componente para mostrar lista de errores de validación
 */
export interface ValidationSummaryProps {
  errors: string[];
  title?: string;
  className?: string;
  onDismiss?: () => void;
}

const ValidationSummaryComponent: React.FC<ValidationSummaryProps> = ({
  errors,
  title = 'Errores de validación',
  className = '',
  onDismiss
}) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        bg-red-50 border border-red-200 rounded-lg p-4
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-900 mb-2">
            {title}
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={`error-${index}`} className="flex items-start gap-1">
                <span className="text-red-500 mt-1">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 text-red-600 hover:text-red-700 transition-colors"
            aria-label="Cerrar"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>
          </button>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Hook para crear mensajes de validación personalizados
 */
export const useValidationMessage = () => {
  const createErrorMessage = (message: string) => ({
    type: 'error' as const,
    message
  });

  const createWarningMessage = (message: string) => ({
    type: 'warning' as const,
    message
  });

  const createSuccessMessage = (message: string) => ({
    type: 'success' as const,
    message
  });

  const createInfoMessage = (message: string) => ({
    type: 'info' as const,
    message
  });

  return {
    error: createErrorMessage,
    warning: createWarningMessage,
    success: createSuccessMessage,
    info: createInfoMessage
  };
};

// Componentes optimizados con memoización
export const ValidationMessage = withMemoization(ValidationMessageComponent, {
  compareProps: (prevProps, nextProps) => {
    return prevProps.type === nextProps.type &&
           prevProps.message === nextProps.message &&
           prevProps.className === nextProps.className &&
           prevProps.showIcon === nextProps.showIcon;
  },
  displayName: 'ValidationMessage',
  enableProfiling: import.meta.env.VITE_MODE === 'debugging'
});

export const FieldValidation = withMemoization(FieldValidationComponent, {
  compareProps: (prevProps, nextProps) => {
    // Comparación profunda de arrays de errores
    if (prevProps.errors.length !== nextProps.errors.length) return false;
    for (let i = 0; i < prevProps.errors.length; i++) {
      if (prevProps.errors[i] !== nextProps.errors[i]) return false;
    }
    return prevProps.className === nextProps.className &&
           prevProps.showIcon === nextProps.showIcon;
  },
  displayName: 'FieldValidation',
  enableProfiling: import.meta.env.VITE_MODE === 'debugging'
});

export const ValidationSummary = withMemoization(ValidationSummaryComponent, {
  compareProps: (prevProps, nextProps) => {
    // Comparación profunda de arrays de errores
    if (prevProps.errors.length !== nextProps.errors.length) return false;
    for (let i = 0; i < prevProps.errors.length; i++) {
      if (prevProps.errors[i] !== nextProps.errors[i]) return false;
    }
    return prevProps.title === nextProps.title &&
           prevProps.className === nextProps.className &&
           prevProps.onDismiss === nextProps.onDismiss;
  },
  displayName: 'ValidationSummary',
  enableProfiling: import.meta.env.VITE_MODE === 'debugging'
});