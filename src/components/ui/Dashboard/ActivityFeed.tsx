// src/components/ui/Dashboard/ActivityFeed.jsx
import {motion} from "motion/react";
import PropTypes from "prop-types";

const ActivityFeed = ({activities = [], className = ""}) => {
	const getActivityIcon = (type) => {
		switch (type) {
			case "course_completed":
				return (
					<div className="bg-green-100 text-green-600 p-2 rounded-full">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				);
			case "user_joined":
				return (
					<div className="bg-blue-100 text-blue-600 p-2 rounded-full">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
						</svg>
					</div>
				);
			case "certificate_earned":
				return (
					<div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				);
			default:
				return (
					<div className="bg-gray-100 text-gray-600 p-2 rounded-full">
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				);
		}
	};

	return (
		<div className={`space-y-4 ${className}`}>
			{activities.map((activity, index) => (
				<motion.div
					key={activity.id || index}
					initial={{opacity: 0, x: -20}}
					animate={{opacity: 1, x: 0}}
					transition={{duration: 0.3, delay: index * 0.1}}
					className="flex items-start space-x-3"
				>
					{getActivityIcon(activity.type)}

					<div className="flex-1 min-w-0">
						<p className="text-sm text-gray-900 dark:text-white">
							{activity.message}
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
							{activity.time}
						</p>
					</div>
				</motion.div>
			))}

			{activities.length === 0 && (
				<div className="text-center py-8">
					<p className="text-gray-500 dark:text-gray-400">
						No hay actividad reciente
					</p>
				</div>
			)}
		</div>
	);
};

ActivityFeed.propTypes = {
	activities: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			type: PropTypes.string.isRequired,
			message: PropTypes.string.isRequired,
			time: PropTypes.string.isRequired,
		})
	),
	className: PropTypes.string,
};

export default ActivityFeed;