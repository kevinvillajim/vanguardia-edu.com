import React, { ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';
import classNames from 'classnames';

export interface CardProps extends Omit<MotionProps, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  interactive?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  rounded = 'md',
  shadow = 'md',
  hover = false,
  interactive = false,
  className,
  ...motionProps
}) => {
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const roundedStyles = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const baseClasses = [
    'transition-all duration-200 ease-in-out',
    variantStyles[variant],
    paddingStyles[padding],
    roundedStyles[rounded],
    shadowStyles[shadow],
  ];

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';
  const interactiveClasses = interactive ? 'cursor-pointer select-none' : '';

  const motionConfig = {
    whileHover: hover ? { y: -2, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' } : {},
    whileTap: interactive ? { scale: 0.98 } : {},
    transition: { type: 'spring', stiffness: 400, damping: 17 },
    ...motionProps,
  };

  return (
    <motion.div
      className={classNames(
        baseClasses,
        hoverClasses,
        interactiveClasses,
        className
      )}
      {...motionConfig}
    >
      {children}
    </motion.div>
  );
};

// Card sub-components for better composition
export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={classNames('mb-4', className)}>
    {children}
  </div>
);

export interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => (
  <div className={classNames('flex-1', className)}>
    {children}
  </div>
);

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={classNames('mt-4 pt-4 border-t border-gray-200', className)}>
    {children}
  </div>
);

export interface CardTitleProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, level = 3, className }) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  const levelStyles = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-bold',
    3: 'text-xl font-semibold',
    4: 'text-lg font-semibold',
    5: 'text-base font-medium',
    6: 'text-sm font-medium',
  };

  return (
    <Component className={classNames('text-gray-900 mb-2', levelStyles[level], className)}>
      {children}
    </Component>
  );
};

export interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => (
  <p className={classNames('text-gray-600 text-sm', className)}>
    {children}
  </p>
);

export default Card;