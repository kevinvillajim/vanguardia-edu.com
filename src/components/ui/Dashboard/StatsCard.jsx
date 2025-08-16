// src/components/ui/Dashboard/StatsCard.jsx
import {motion} from "motion/react";
import PropTypes from "prop-types";

const StatsCard = ({
	title,
	value,
	change,
	changeType = "positive",
	icon,
	color = "blue",
	trend = [],
	className = "",
}) => {
	const colorClasses = {
		blue: "from-blue-500 to-blue-600",
		green: "from-green-500 to-green-600",
		purple: "from-purple-500 to-purple-600",
		orange: "from-orange-500 to-orange-600",
		red: "from-red-500 to-red-600",
	};

	const changeColors = {
		positive: "text-green-600 dark:text-green-400",
		negative: "text-red-600 dark:text-red-400",
		neutral: "text-gray-600 dark:text-gray-400",
	};

	return (
		<motion.div
			initial={{opacity: 0, y: 20}}
			animate={{opacity: 1, y: 0}}
			transition={{duration: 0.3}}
			className={`
        relative overflow-hidden
        bg-white dark:bg-gray-800 
        rounded-2xl p-6 shadow-lg
        border border-gray-200 dark:border-gray-700
        hover:shadow-xl transition-all duration-300
        ${className}
      `}
		>
			{/* Gradient Background */}
			<div
				className={`
        absolute top-0 right-0 w-32 h-32 opacity-10
        bg-gradient-to-br ${colorClasses[color]} 
        rounded-full -mr-16 -mt-16
      `}
			/>

			{/* Content */}
			<div className="relative z-10">
				<div className="flex items-center justify-between mb-4">
					<div
						className={`
            p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} 
            text-white shadow-lg
          `}
					>
						{icon}
					</div>

					{change && (
						<div
							className={`
              flex items-center text-sm font-medium ${changeColors[changeType]}
            `}
						>
							{changeType === "positive" && (
								<svg
									className="w-4 h-4 mr-1"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							)}
							{changeType === "negative" && (
								<svg
									className="w-4 h-4 mr-1"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							)}
							{change}
						</div>
					)}
				</div>

				<div className="space-y-2">
					<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
						{title}
					</p>
					<p className="text-3xl font-bold text-gray-900 dark:text-white">
						{value}
					</p>
				</div>

				{/* Mini Trend Chart */}
				{trend.length > 0 && (
					<div className="mt-4 h-12 flex items-end space-x-1">
						{trend.map((point, index) => (
							<div
								key={index}
								className={`
                  flex-1 bg-gradient-to-t ${colorClasses[color]} 
                  rounded-sm opacity-60
                `}
								style={{height: `${(point / Math.max(...trend)) * 100}%`}}
							/>
						))}
					</div>
				)}
			</div>
		</motion.div>
	);
};

StatsCard.propTypes = {
	title: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	change: PropTypes.string,
	changeType: PropTypes.oneOf(["positive", "negative", "neutral"]),
	icon: PropTypes.node.isRequired,
	color: PropTypes.oneOf(["blue", "green", "purple", "orange", "red"]),
	trend: PropTypes.arrayOf(PropTypes.number),
	className: PropTypes.string,
};

export default StatsCard;