import React, { Suspense, ComponentType, lazy } from 'react';
import { motion } from 'framer-motion';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';

interface LazyWrapperProps {
  children?: React.ReactNode;
  fallback?: React.ComponentType;
  errorFallback?: React.ReactNode;
  loadingText?: string;
}

const DefaultLoadingFallback: React.FC<{ loadingText?: string }> = ({ loadingText = 'Cargando...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center"
    >
      <motion.div
        className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <p className="text-gray-600 text-lg">{loadingText}</p>
    </motion.div>
  </div>
);

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback: CustomFallback,
  errorFallback,
  loadingText
}) => {
  const LoadingComponent = CustomFallback || (() => <DefaultLoadingFallback loadingText={loadingText} />);

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={<LoadingComponent />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// HOC for lazy loading components
export const withLazyLoading = <P extends object>(
  componentLoader: () => Promise<{ default: ComponentType<P> }>,
  loadingText?: string,
  errorFallback?: React.ReactNode
) => {
  const LazyComponent = lazy(() => {
    return componentLoader().catch((error) => {
      console.error('Error loading component:', error);
      // Return a fallback component in case of loading failure
      return {
        default: () => (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar el componente</h3>
              <p className="text-gray-600">Por favor, intenta recargar la página.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Recargar
              </button>
            </div>
          </div>
        ) as ComponentType<P>
      };
    });
  });

  const WrappedComponent = (props: P) => (
    <LazyWrapper loadingText={loadingText} errorFallback={errorFallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );

  // Add display name for debugging
  WrappedComponent.displayName = `withLazyLoading(${LazyComponent.displayName || 'Component'})`;

  return WrappedComponent;
};

// Utility for preloading components
export const preloadComponent = (componentLoader: () => Promise<any>) => {
  componentLoader();
};

export default LazyWrapper;