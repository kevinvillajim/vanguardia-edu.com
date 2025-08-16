// src/components/ui/Button/Button.jsx
import {motion} from "motion/react";
import PropTypes from "prop-types";

const Button = ({
	children,
	variant = "primary",
	size = "md",
	disabled = false,
	loading = false,
	fullWidth = false,
	leftIcon,
	rightIcon,
	className = "",
	onClick,
	...props
}) => {
	const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-xl
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? "w-full" : ""}
  `;

	const variants = {
		primary: `
      bg-gradient-to-br from-primary-800 to-secondary-900 text-white
      hover:from-primary-600 hover:to-primary-900
      focus:ring-primary-500 shadow-lg hover:shadow-xl
      active:scale-95
    `,
		acent: `
      bg-gradient-to-br from-acent-500 to-acent-700 text-white
      hover:from-acent-400 hover:to-acent-600
      focus:ring-acent-500 shadow-lg hover:shadow-xl
      active:scale-95
    `,
		secondary: `
      bg-white dark:bg-gray-800 text-primary-500 dark:text-white
      border-2 border-secondary-300 dark:border-primary-600
      hover:bg-secondary-300 dark:hover:bg-gray-700
      focus:ring-primary-500 shadow-md hover:shadow-lg
      active:scale-95
    `,
		outline: `
      bg-transparent text-primary-600 dark:text-primary-400
      border-2 border-primary-600 dark:border-primary-400
      hover:bg-primary-50 dark:hover:bg-primary-900/20
      focus:ring-primary-500 active:scale-95
    `,
		ghost: `
      bg-transparent text-gray-700 dark:text-gray-300
      hover:bg-primary-100 dark:hover:bg-gray-800
      focus:ring-primary-500 active:scale-95
    `,
		danger: `
      bg-gradient-to-r from-red-600 to-red-700 text-white
      hover:from-red-700 hover:to-red-800
      focus:ring-red-500 shadow-lg hover:shadow-xl
      active:scale-95
    `,
		success: `
      bg-gradient-to-r from-success-500 to-success-700 text-white
      hover:from-success-600 hover:to-success-800
      focus:ring-success-500 shadow-lg hover:shadow-xl
      active:scale-95
    `,
	};

	const sizes = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2 text-base",
		lg: "px-6 py-3 text-lg",
		xl: "px-8 py-4 text-xl",
	};

	return (
		<motion.button
			whileHover={{scale: disabled ? 1 : 1.02}}
			whileTap={{scale: disabled ? 1 : 0.98}}
			className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
			disabled={disabled || loading}
			onClick={onClick}
			{...props}
		>
			{loading && (
				<svg
					className="animate-spin -ml-1 mr-2 h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			)}
			{leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
			{children}
			{rightIcon && !loading && <span className="ml-2">{rightIcon}</span>}
		</motion.button>
	);
};

Button.propTypes = {
	children: PropTypes.node.isRequired,
	variant: PropTypes.oneOf([
		"primary",
		"acent",
		"secondary",
		"outline",
		"ghost",
		"danger",
		"success",
	]),
	size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
	disabled: PropTypes.bool,
	loading: PropTypes.bool,
	fullWidth: PropTypes.bool,
	leftIcon: PropTypes.node,
	rightIcon: PropTypes.node,
	className: PropTypes.string,
	onClick: PropTypes.func,
};

export default Button;