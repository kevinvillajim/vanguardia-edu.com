// src/components/ui/Dashboard/ChartCard.jsx
import {motion} from "framer-motion";
import PropTypes from "prop-types";

const ChartCard = ({
	title,
	subtitle,
	children,
	actions,
	className = "",
	loading = false,
}) => {
	return (
		<motion.div
			initial={{opacity: 0, y: 20}}
			animate={{opacity: 1, y: 0}}
			transition={{duration: 0.3, delay: 0.1}}
			className={`
        bg-white dark:bg-gray-800 
        rounded-2xl p-6 shadow-lg
        border border-gray-200 dark:border-gray-700
        ${className}
      `}
		>
			{/* Header */}
			<div className="flex items-start justify-between mb-6">
				<div>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
						{title}
					</h3>
					{subtitle && (
						<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
							{subtitle}
						</p>
					)}
				</div>

				{actions && <div className="flex space-x-2">{actions}</div>}
			</div>

			{/* Content */}
			<div className="relative">
				{loading ? (
					<div className="flex items-center justify-center h-64">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					</div>
				) : (
					children
				)}
			</div>
		</motion.div>
	);
};

ChartCard.propTypes = {
	title: PropTypes.string.isRequired,
	subtitle: PropTypes.string,
	children: PropTypes.node.isRequired,
	actions: PropTypes.node,
	className: PropTypes.string,
	loading: PropTypes.bool,
};

export default ChartCard;