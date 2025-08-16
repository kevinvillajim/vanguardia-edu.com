// src/components/ui/Loading/LoadingSpinner.jsx - Versión mejorada
import {motion} from "motion/react";
import PropTypes from "prop-types";

const LoadingSpinner = ({
	size = "md",
	color = "blue",
	className = "",
	variant = "spinner",
}) => {
	const sizes = {
		xs: "w-4 h-4",
		sm: "w-6 h-6",
		md: "w-8 h-8",
		lg: "w-12 h-12",
		xl: "w-16 h-16",
	};

	const colors = {
		blue: "text-blue-600 dark:text-blue-400",
		green: "text-green-600 dark:text-green-400",
		purple: "text-purple-600 dark:text-purple-400",
		red: "text-red-600 dark:text-red-400",
		orange: "text-orange-600 dark:text-orange-400",
		gray: "text-gray-600 dark:text-gray-400",
	};

	const sizeClass = sizes[size];
	const colorClass = colors[color];

	if (variant === "dots") {
		return (
			<div className={`flex space-x-1 ${className}`}>
				{[0, 1, 2].map((index) => (
					<motion.div
						key={index}
						className={`w-2 h-2 bg-current rounded-full ${colorClass}`}
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.3, 1, 0.3],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							delay: index * 0.2,
						}}
					/>
				))}
			</div>
		);
	}

	if (variant === "pulse") {
		return (
			<motion.div
				className={`${sizeClass} ${colorClass} ${className}`}
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.5, 1, 0.5],
				}}
				transition={{
					duration: 1.5,
					repeat: Infinity,
				}}
			>
				<div className="w-full h-full bg-current rounded-full" />
			</motion.div>
		);
	}

	if (variant === "bars") {
		return (
			<div className={`flex items-end space-x-1 ${className}`}>
				{[0, 1, 2, 3, 4].map((index) => (
					<motion.div
						key={index}
						className={`w-1 bg-current rounded-full ${colorClass}`}
						animate={{
							height: ["4px", "16px", "4px"],
						}}
						transition={{
							duration: 1,
							repeat: Infinity,
							delay: index * 0.1,
						}}
					/>
				))}
			</div>
		);
	}

	if (variant === "ring") {
		return (
			<div className={`${sizeClass} ${className} relative`}>
				<motion.div
					className={`w-full h-full border-2 border-current border-t-transparent rounded-full ${colorClass}`}
					animate={{ rotate: 360 }}
					transition={{
						duration: 1,
						repeat: Infinity,
						ease: "linear",
					}}
				/>
			</div>
		);
	}

	// Default modern spinner variant
	return (
		<div className={`${sizeClass} ${className} relative`}>
			{/* Outer ring */}
			<motion.div
				className={`absolute inset-0 border-2 border-current border-opacity-20 rounded-full ${colorClass}`}
			/>
			{/* Spinning part */}
			<motion.div
				className={`absolute inset-0 border-2 border-transparent border-t-current rounded-full ${colorClass}`}
				animate={{ rotate: 360 }}
				transition={{
					duration: 1,
					repeat: Infinity,
					ease: "linear",
				}}
			/>
			{/* Inner dot */}
			<motion.div
				className={`absolute top-1/2 left-1/2 w-1 h-1 bg-current rounded-full transform -translate-x-1/2 -translate-y-1/2 ${colorClass}`}
				animate={{
					scale: [1, 1.5, 1],
					opacity: [0.5, 1, 0.5],
				}}
				transition={{
					duration: 1,
					repeat: Infinity,
				}}
			/>
		</div>
	);
};

LoadingSpinner.propTypes = {
	size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
	color: PropTypes.oneOf(["blue", "green", "purple", "red", "orange", "gray"]),
	className: PropTypes.string,
	variant: PropTypes.oneOf(["spinner", "dots", "pulse", "bars", "ring"]),
};

export default LoadingSpinner;