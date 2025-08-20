import React, { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: 'outlined' | 'filled' | 'standard';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'outlined',
      inputSize = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      className,
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Base styles
    const baseInputStyles = [
      'w-full transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-blue-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ];

    // Variant styles
    const variantStyles = {
      outlined: [
        'border border-gray-300 rounded-md bg-white',
        'hover:border-gray-400',
        'focus:border-blue-500',
        error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
      ],
      filled: [
        'border-0 rounded-t-md bg-gray-50 border-b-2 border-gray-300',
        'hover:bg-gray-100',
        'focus:bg-white focus:border-blue-500',
        error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
      ],
      standard: [
        'border-0 border-b border-gray-300 bg-transparent rounded-none',
        'hover:border-gray-400',
        'focus:border-blue-500',
        error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
      ],
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    const inputClasses = classNames(
      baseInputStyles,
      variantStyles[variant],
      sizeStyles[inputSize],
      {
        'pl-10': leftIcon && inputSize === 'sm',
        'pl-12': leftIcon && inputSize === 'md',
        'pl-14': leftIcon && inputSize === 'lg',
        'pr-10': rightIcon && inputSize === 'sm',
        'pr-12': rightIcon && inputSize === 'md',
        'pr-14': rightIcon && inputSize === 'lg',
      },
      className
    );

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const iconPositionClasses = {
      left: {
        sm: 'left-3',
        md: 'left-3',
        lg: 'left-4',
      },
      right: {
        sm: 'right-3',
        md: 'right-3',
        lg: 'right-4',
      },
    };

    return (
      <div className={classNames('relative', { 'w-full': fullWidth })}>
        {label && (
          <motion.label
            htmlFor={inputId}
            className={classNames(
              'block text-sm font-medium mb-1 transition-colors duration-200',
              error ? 'text-red-700' : 'text-gray-700',
              { 'text-blue-600': isFocused && !error }
            )}
            animate={{
              color: error ? '#dc2626' : isFocused ? '#2563eb' : '#374151',
            }}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={classNames(
                'absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center',
                'text-gray-400 pointer-events-none',
                iconPositionClasses.left[inputSize]
              )}
            >
              <div className={iconSizeClasses[inputSize]}>{leftIcon}</div>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled || loading}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {(rightIcon || loading) && (
            <div
              className={classNames(
                'absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center',
                'text-gray-400',
                iconPositionClasses.right[inputSize]
              )}
            >
              {loading ? (
                <motion.div
                  className={classNames('border-2 border-gray-300 border-t-blue-500 rounded-full', iconSizeClasses[inputSize])}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              ) : (
                <div className={iconSizeClasses[inputSize]}>{rightIcon}</div>
              )}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1"
          >
            {error ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            ) : (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;