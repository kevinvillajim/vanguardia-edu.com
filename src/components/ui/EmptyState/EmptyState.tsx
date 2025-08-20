// src/components/ui/EmptyState/EmptyState.jsx
import {motion} from "framer-motion";
import Button from "@/shared/components/ui/Button/Button";
import PropTypes from "prop-types";

const EmptyState = ({
    icon,
    title,
    description,
    action,
    className = "",
    variant = "default",
}) => {
    const variants = {
        default: "text-gray-400",
        error: "text-red-400",
        success: "text-green-400",
        warning: "text-yellow-400",
    };

    const defaultIcons = {
        default: (
            <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
            </svg>
        ),
        error: (
            <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
        success: (
            <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
        warning: (
            <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            </svg>
        ),
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
        >
            <motion.div
                initial={{scale: 0}}
                animate={{scale: 1}}
                transition={{delay: 0.2, type: "spring", stiffness: 200}}
                className={`mb-6 ${variants[variant]}`}
            >
                {icon || defaultIcons[variant]}
            </motion.div>

            <motion.h3
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.3}}
                className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
            >
                {title}
            </motion.h3>

            {description && (
                <motion.p
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.4}}
                    className="text-gray-600 dark:text-gray-400 mb-6 max-w-md leading-relaxed"
                >
                    {description}
                </motion.p>
            )}

            {action && (
                <motion.div
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.5}}
                >
                    {action}
                </motion.div>
            )}
        </motion.div>
    );
};

EmptyState.propTypes = {
    icon: PropTypes.node,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    action: PropTypes.node,
    className: PropTypes.string,
    variant: PropTypes.oneOf(["default", "error", "success", "warning"]),
};

export default EmptyState;