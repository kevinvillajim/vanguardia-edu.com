// src/components/ui/Form/FormField.jsx
import {motion, AnimatePresence} from "framer-motion";
import PropTypes from "prop-types";

const FormField = ({
	children,
	label,
	error,
	helper,
	required = false,
	className = "",
}) => {
	return (
		<div className={`space-y-2 ${className}`}>
			{label && (
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}

			{children}

			<AnimatePresence>
				{error && (
					<motion.div
						initial={{opacity: 0, y: -10}}
						animate={{opacity: 1, y: 0}}
						exit={{opacity: 0, y: -10}}
						className="flex items-center space-x-1 text-red-600 dark:text-red-400 text-sm"
					>
						<svg
							className="w-4 h-4 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{error}</span>
					</motion.div>
				)}
			</AnimatePresence>

			{helper && !error && (
				<p className="text-sm text-gray-500 dark:text-gray-400">{helper}</p>
			)}
		</div>
	);
};

FormField.propTypes = {
	children: PropTypes.node.isRequired,
	label: PropTypes.string,
	error: PropTypes.string,
	helper: PropTypes.string,
	required: PropTypes.bool,
	className: PropTypes.string,
};

export default FormField;