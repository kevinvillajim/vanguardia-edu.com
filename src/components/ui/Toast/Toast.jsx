// src/components/ui/Toast/Toast.jsx
import {createContext, useContext, useState, useCallback} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {createPortal} from "react-dom";
import PropTypes from "prop-types";

const ToastContext = createContext();

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast debe ser usado dentro de un ToastProvider");
	}
	return context;
};

const Toast = ({toast, onRemove}) => {
	const icons = {
		success: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M5 13l4 4L19 7"
				/>
			</svg>
		),
		error: (
			<svg
				className="w-5 h-5"
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
		),
		warning: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>
		),
		info: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
		),
	};

	const colors = {
		success:
			"bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
		error:
			"bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
		warning:
			"bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200",
		info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
	};

	const iconColors = {
		success: "text-green-500",
		error: "text-red-500",
		warning: "text-yellow-500",
		info: "text-blue-500",
	};

	return (
		<motion.div
			initial={{opacity: 0, y: -50, scale: 0.9}}
			animate={{opacity: 1, y: 0, scale: 1}}
			exit={{opacity: 0, y: -50, scale: 0.9}}
			transition={{duration: 0.3}}
			className={`
        relative flex items-start p-4 mb-3 border rounded-xl shadow-lg backdrop-blur-sm
        ${colors[toast.type]}
      `}
		>
			<div className={`flex-shrink-0 ${iconColors[toast.type]}`}>
				{icons[toast.type]}
			</div>

			<div className="ml-3 flex-1">
				{toast.title && <h4 className="font-medium mb-1">{toast.title}</h4>}
				<p className="text-sm">{toast.message}</p>
			</div>

			<button
				onClick={() => onRemove(toast.id)}
				className="flex-shrink-0 ml-4 opacity-70 hover:opacity-100 transition-opacity"
			>
				<svg
					className="w-4 h-4"
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

			{/* Progress Bar */}
			{toast.duration && (
				<motion.div
					initial={{width: "100%"}}
					animate={{width: "0%"}}
					transition={{duration: toast.duration / 1000, ease: "linear"}}
					className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-xl"
				/>
			)}
		</motion.div>
	);
};

Toast.propTypes = {
	toast: PropTypes.shape({
		id: PropTypes.string.isRequired,
		type: PropTypes.oneOf(["success", "error", "warning", "info"]).isRequired,
		title: PropTypes.string,
		message: PropTypes.string.isRequired,
		duration: PropTypes.number,
	}).isRequired,
	onRemove: PropTypes.func.isRequired,
};

export const ToastProvider = ({children}) => {
	const [toasts, setToasts] = useState([]);

	const addToast = useCallback((toast) => {
		const id = Math.random().toString(36).substr(2, 9);
		const newToast = {
			id,
			duration: 5000,
			...toast,
		};

		setToasts((prev) => [...prev, newToast]);

		if (newToast.duration) {
			setTimeout(() => {
				removeToast(id);
			}, newToast.duration);
		}

		return id;
	}, []);

	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const toast = {
		success: (message, options = {}) =>
			addToast({...options, message, type: "success"}),
		error: (message, options = {}) =>
			addToast({...options, message, type: "error"}),
		warning: (message, options = {}) =>
			addToast({...options, message, type: "warning"}),
		info: (message, options = {}) =>
			addToast({...options, message, type: "info"}),
	};

	return (
		<ToastContext.Provider value={{toast, removeToast}}>
			{children}
			{createPortal(
				<div className="fixed top-4 right-4 z-50 w-96 max-w-sm">
					<AnimatePresence>
						{toasts.map((toastItem) => (
							<Toast
								key={toastItem.id}
								toast={toastItem}
								onRemove={removeToast}
							/>
						))}
					</AnimatePresence>
				</div>,
				document.body
			)}
		</ToastContext.Provider>
	);
};

ToastProvider.propTypes = {
	children: PropTypes.node.isRequired,
};


export default Toast;