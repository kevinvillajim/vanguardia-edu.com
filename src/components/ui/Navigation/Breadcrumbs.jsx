// src/components/ui/Navigation/Breadcrumbs.jsx
import {motion} from "framer-motion";
import PropTypes from "prop-types";

const Breadcrumbs = ({items, className = ""}) => {
	return (
		<nav className={`flex items-center space-x-2 text-sm ${className}`}>
			{items.map((item, index) => (
				<motion.div
					key={index}
					initial={{opacity: 0, x: -10}}
					animate={{opacity: 1, x: 0}}
					transition={{delay: index * 0.1}}
					className="flex items-center space-x-2"
				>
					{index > 0 && (
						<svg
							className="w-4 h-4 text-gray-400 dark:text-gray-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					)}

					{item.href ? (
						<a
							href={item.href}
							className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
						>
							{item.label}
						</a>
					) : (
						<span className="text-gray-900 dark:text-white font-medium">
							{item.label}
						</span>
					)}
				</motion.div>
			))}
		</nav>
	);
};

Breadcrumbs.propTypes = {
	items: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			href: PropTypes.string,
		})
	).isRequired,
	className: PropTypes.string,
};


export default Breadcrumbs;
