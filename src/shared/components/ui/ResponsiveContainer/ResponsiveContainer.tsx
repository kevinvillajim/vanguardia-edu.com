import React from 'react';
import { useResponsive } from '../../../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    xl?: string;
  };
  padding?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  center?: boolean;
  fluid?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = {
    mobile: '100%',
    tablet: '768px',
    desktop: '1024px',
    xl: '1280px'
  },
  padding = {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem'
  },
  center = true,
  fluid = false
}) => {
  const { isMobile, isTablet, isXLarge } = useResponsive();

  const containerStyles = {
    maxWidth: fluid ? '100%' : 
              isMobile ? maxWidth.mobile : 
              isTablet ? maxWidth.tablet : 
              isXLarge ? maxWidth.xl : 
              maxWidth.desktop,
    padding: isMobile ? padding.mobile : 
             isTablet ? padding.tablet : 
             padding.desktop,
    margin: center ? '0 auto' : '0'
  };

  const responsiveClass = fluid 
    ? 'w-full' 
    : isMobile ? 'max-w-full' : 
      isTablet ? 'max-w-3xl' : 
      isXLarge ? 'max-w-7xl' : 
      'max-w-6xl';

  const paddingClass = isMobile ? 'px-4' : 
                      isTablet ? 'px-6' : 
                      'px-8';

  const centerClass = center ? 'mx-auto' : '';

  return (
    <div 
      className={`${responsiveClass} ${paddingClass} ${centerClass} ${className}`}
      style={containerStyles}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;