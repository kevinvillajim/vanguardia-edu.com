import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, MotionProps } from 'framer-motion';
import classNames from 'classnames';

// Design tokens - exact copy from backup
const buttonVariants = {
  primary: 'bg-gradient-to-br from-primary-800 to-secondary-900 text-white hover:from-primary-600 hover:to-primary-900 focus:ring-primary-500 shadow-lg hover:shadow-xl active:scale-95',
  acent: 'bg-gradient-to-br from-acent-500 to-acent-700 text-white hover:from-acent-400 hover:to-acent-600 focus:ring-acent-500 shadow-lg hover:shadow-xl active:scale-95',
  secondary: 'bg-white dark:bg-gray-800 text-primary-500 dark:text-white border-2 border-secondary-300 dark:border-primary-600 hover:bg-secondary-300 dark:hover:bg-gray-700 focus:ring-primary-500 shadow-md hover:shadow-lg active:scale-95',
  outline: 'bg-transparent text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500 active:scale-95',
  ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-800 focus:ring-primary-500 active:scale-95',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-lg hover:shadow-xl active:scale-95',
  success: 'bg-gradient-to-r from-success-500 to-success-700 text-white hover:from-success-600 hover:to-success-800 focus:ring-success-500 shadow-lg hover:shadow-xl active:scale-95',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
} as const;

const buttonSizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
} as const;

const buttonShapes = {
  square: 'rounded-none',
  rounded: 'rounded-xl',
  pill: 'rounded-full',
} as const;

export interface ButtonProps 
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
          Omit<MotionProps, 'children'> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  shape?: keyof typeof buttonShapes;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      shape = 'rounded',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'relative overflow-hidden',
    ];

    const classes = classNames(
      baseClasses,
      buttonVariants[variant],
      buttonSizes[size],
      buttonShapes[shape],
      {
        'w-full': fullWidth,
        'cursor-not-allowed': disabled || loading,
      },
      className
    );

    const motionProps = {
      whileHover: !disabled && !loading ? { scale: 1.02 } : {},
      whileTap: !disabled && !loading ? { scale: 0.95 } : {},
      transition: { type: 'spring', stiffness: 400, damping: 17 },
    };

    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...motionProps}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-current opacity-20">
            <Spinner size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} />
          </div>
        )}
        
        <div className={classNames('flex items-center gap-2', { 'opacity-0': loading })}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </div>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Spinner component for loading state
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.div
      className={classNames(
        'border-2 border-white border-t-transparent rounded-full',
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

export default Button;