import React from 'react';
import { ErrorBoundary } from './shared/components/ErrorBoundary/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppRouter } from './core/router/Router';
import './styles/globals.css';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to error reporting service
        console.error('App-level error:', error, errorInfo);
        
        // Here you would typically send to error tracking service
        // errorService.captureException(error, { extra: errorInfo });
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
