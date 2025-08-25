import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home, FileText } from 'lucide-react';
import { createComponentLogger } from '../utils/logger';

const logger = createComponentLogger('ErrorBoundary');

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  level?: 'page' | 'section' | 'component';
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

/**
 * Advanced Error Boundary with fallback UI and error reporting
 * Follows React error handling best practices
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    const { errorId } = this.state;

    logger.error('Component error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId
    });

    this.setState({
      errorInfo
    });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo, errorId);
    }

    // Report to external error tracking service
    this.reportError(error, errorInfo, errorId);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when specified props change
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) => 
        prevProps.resetKeys?.[index] !== key
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    // In a real application, you would report this to your error tracking service
    // e.g., Sentry, LogRocket, Rollbar, etc.
    
    try {
      // Example: Send to analytics or error tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: error.message,
          fatal: false,
          custom_map: {
            error_id: errorId,
            component_stack: errorInfo.componentStack
          }
        });
      }
    } catch (reportingError) {
      logger.error('Failed to report error', { reportingError });
    }
  };

  private resetErrorBoundary = () => {
    logger.info('Error boundary reset triggered');
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportIssue = () => {
    const { error, errorInfo, errorId } = this.state;
    
    const subject = `Error Report - ${errorId}`;
    const body = `
Error ID: ${errorId}
Error Message: ${error?.message}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Error Stack:
${error?.stack}

Component Stack:
${errorInfo?.componentStack}
    `.trim();

    const mailtoLink = `mailto:support@vanguardia.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  private renderFallbackUI() {
    const { error, errorId } = this.state;
    const { level = 'component' } = this.props;

    const levelConfig = {
      page: {
        title: 'Oops! Algo salió mal',
        description: 'Ha ocurrido un error inesperado en esta página. Nuestro equipo ha sido notificado automáticamente.',
        showReload: true,
        showHome: true,
        containerClass: 'min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4'
      },
      section: {
        title: 'Error en esta sección',
        description: 'No se pudo cargar esta sección correctamente. Puedes intentar recargar o continuar navegando.',
        showReload: false,
        showHome: false,
        containerClass: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 my-4'
      },
      component: {
        title: 'Error del componente',
        description: 'Este componente no se pudo cargar correctamente.',
        showReload: false,
        showHome: false,
        containerClass: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'
      }
    };

    const config = levelConfig[level];

    return (
      <div className={config.containerClass}>
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {config.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {config.description}
            </p>
            
            {process.env.NODE_ENV === 'development' && error && (
              <details className="text-left bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <summary className="cursor-pointer font-medium text-gray-900 dark:text-white mb-2">
                  Detalles del error (desarrollo)
                </summary>
                <div className="text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">
                  {error.message}
                  {error.stack && (
                    <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                      {error.stack}
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Intentar de nuevo
            </button>

            {config.showReload && (
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                Recargar página
              </button>
            )}

            {config.showHome && (
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Ir al inicio
              </button>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={this.handleReportIssue}
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Reportar este problema
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              ID del error: {errorId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback component provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return this.renderFallbackUI();
    }

    return children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for error boundary reset
export function useErrorBoundaryReset() {
  const [resetKey, setResetKey] = React.useState(0);

  const reset = React.useCallback(() => {
    setResetKey(prev => prev + 1);
  }, []);

  return { resetKey, reset };
}

export default ErrorBoundary;