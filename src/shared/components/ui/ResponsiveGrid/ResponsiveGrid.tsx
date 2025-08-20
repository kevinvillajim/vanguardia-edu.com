import React from 'react';
import { useResponsive } from '../../../hooks/useResponsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    xl?: number;
  };
  gap?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  itemMinWidth?: string;
  autoFit?: boolean;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  cols = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    xl: 4
  },
  gap = {
    mobile: 4,
    tablet: 6,
    desktop: 8
  },
  itemMinWidth = '280px',
  autoFit = false
}) => {
  const { isMobile, isTablet, isXLarge, isDesktop } = useResponsive();

  const getGridConfig = () => {
    if (autoFit) {
      return {
        gridTemplateColumns: `repeat(auto-fit, minmax(${itemMinWidth}, 1fr))`,
        gap: isMobile ? `${gap.mobile || 4} * 0.25rem` : 
             isTablet ? `${gap.tablet || 6} * 0.25rem` : 
             `${gap.desktop || 8} * 0.25rem`
      };
    }

    const currentCols = isMobile ? cols.mobile : 
                       isTablet ? cols.tablet : 
                       isXLarge ? cols.xl : 
                       cols.desktop;

    const currentGap = isMobile ? gap.mobile : 
                      isTablet ? gap.tablet : 
                      gap.desktop;

    return {
      gridTemplateColumns: `repeat(${currentCols}, 1fr)`,
      gap: `${currentGap || 6} * 0.25rem`
    };
  };

  const gridConfig = getGridConfig();
  const gapClass = isMobile ? `gap-${gap.mobile || 4}` : 
                   isTablet ? `gap-${gap.tablet || 6}` : 
                   `gap-${gap.desktop || 8}`;

  const colsClass = autoFit 
    ? '' 
    : isMobile ? `grid-cols-${cols.mobile || 1}` : 
      isTablet ? `md:grid-cols-${cols.tablet || 2}` : 
      isXLarge ? `xl:grid-cols-${cols.xl || 4}` : 
      `lg:grid-cols-${cols.desktop || 3}`;

  return (
    <div 
      className={`grid ${autoFit ? '' : colsClass} ${gapClass} ${className}`}
      style={autoFit ? gridConfig : undefined}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;