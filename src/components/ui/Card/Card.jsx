// src/components/ui/Card/Card.jsx
import {motion} from "motion/react";
import PropTypes from "prop-types";

const Card = ({
	children,
	variant = "default",
	padding = "md",
	shadow = "md",
	hover = false,
	className = "",
	...props
}) => {
	const baseClasses = `
    bg-white dark:bg-gray-800 
    border border-gray-200 dark:border-gray-700
    rounded-2xl transition-all duration-300
  `;

	const variants = {
		default: "border-gray-200 dark:border-gray-700",
		elevated: "border-0 shadow-lg",
		outlined: "border-2 border-gray-300 dark:border-gray-600",
		glass: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20",
		primary: "border-2 border-primary-200 bg-primary-50 dark:bg-primary-900/20",
		acent: "border-2 border-acent-200 bg-acent-50 dark:bg-acent-900/20",
		secondary: "border-2 border-secondary-300 bg-secondary-50 dark:bg-secondary-900/20",
	};

	const paddings = {
		none: "p-0",
		sm: "p-4",
		md: "p-6",
		lg: "p-8",
		xl: "p-10",
	};

	const shadows = {
		none: "shadow-none",
		sm: "shadow-sm",
		md: "shadow-md",
		lg: "shadow-lg",
		xl: "shadow-xl",
	};

	const hoverClasses = hover ? "hover:shadow-lg hover:-translate-y-1" : "";

	return (
		<motion.div
			initial={{opacity: 0, y: 20}}
			animate={{opacity: 1, y: 0}}
			transition={{duration: 0.3}}
			className={`
        ${baseClasses}
        ${variants[variant]}
        ${paddings[padding]}
        ${shadows[shadow]}
        ${hoverClasses}
        ${className}
      `}
			{...props}
		>
			{children}
		</motion.div>
	);
};

Card.propTypes = {
	children: PropTypes.node.isRequired,
	variant: PropTypes.oneOf(["default", "elevated", "outlined", "glass", "primary", "acent", "secondary"]),
	padding: PropTypes.oneOf(["none", "sm", "md", "lg", "xl"]),
	shadow: PropTypes.oneOf(["none", "sm", "md", "lg", "xl"]),
	hover: PropTypes.bool,
	className: PropTypes.string,
};

export default Card