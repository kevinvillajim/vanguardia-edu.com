// src/components/ui/Modal/Modal.jsx
import {useEffect} from "react";
import {motion, AnimatePresence} from "motion/react";
import {createPortal} from "react-dom";
import PropTypes from "prop-types";

const Modal = ({
	isOpen,
	onClose,
	children,
	title,
	size = "md",
	closeOnBackdrop = true,
	className = "",
}) => {
	const sizes = {
		sm: "max-w-md",
		md: "max-w-lg",
		lg: "max-w-2xl",
		xl: "max-w-4xl",
		full: "max-w-full mx-4",
	};

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	const modalContent = (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					{/* Backdrop */}
					<motion.div
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						exit={{opacity: 0}}
						onClick={closeOnBackdrop ? onClose : undefined}
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
					/>

					{/* Modal */}
					<motion.div
						initial={{opacity: 0, scale: 0.95, y: 20}}
						animate={{opacity: 1, scale: 1, y: 0}}
						exit={{opacity: 0, scale: 0.95, y: 20}}
						transition={{duration: 0.2}}
						className={`
              relative w-full ${sizes[size]} bg-white dark:bg-gray-800 
              rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700
              ${className}
            `}
					>
						{/* Header */}
						{title && (
							<div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
								<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
									{title}
								</h2>
								<button
									onClick={onClose}
									className="
                    p-1 rounded-lg text-gray-400 hover:text-gray-600 
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    transition-colors duration-200
                  "
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						)}

						{/* Content */}
						<div className="p-6">{children}</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);

	return createPortal(modalContent, document.body);
};

Modal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
	title: PropTypes.string,
	size: PropTypes.oneOf(["sm", "md", "lg", "xl", "full"]),
	closeOnBackdrop: PropTypes.bool,
	className: PropTypes.string,
};

export default Modal