import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children: React.ReactNode;
}

const cardVariants = {
  default: 'bg-white border border-gray-200 shadow-sm',
  outlined: 'bg-white border-2 border-gray-300',
  elevated: 'bg-white shadow-lg border border-gray-100',
  filled: 'bg-gray-50 border border-gray-200'
};

const cardPadding = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  children,
  className,
  ...props
}) => {
  const Component = hoverable ? motion.div : 'div';
  const motionProps = hoverable ? {
    whileHover: { y: -2, shadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)' },
    transition: { duration: 0.2 }
  } : {};

  return (
    <Component
      className={cn(
        'rounded-lg transition-all duration-200',
        cardVariants[variant],
        cardPadding[padding],
        hoverable && 'cursor-pointer',
        className
      )}
      {...(hoverable ? motionProps : {})}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => (
  <p className={cn('text-sm text-gray-600 mt-1', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('mt-4 pt-4 border-t border-gray-200', className)} {...props}>
    {children}
  </div>
);