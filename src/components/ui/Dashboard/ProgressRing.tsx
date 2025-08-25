// src/components/ui/Dashboard/ProgressRing.jsx
import {motion} from "framer-motion";
import PropTypes from "prop-types";

const ProgressRing = ({
    progress,
    size = 120,
    strokeWidth = 8,
    color = "blue",
    showPercentage = true,
    className = "",
}) => {
    const colors = {
        blue: "#3b82f6",
        green: "#10b981",
        purple: "#8b5cf6",
        orange: "#f59e0b",
        red: "#ef4444",
    };

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div
            className={`relative inline-flex items-center justify-center ${className}`}
        >
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                />

                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors[color]}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    initial={{strokeDashoffset: circumference}}
                    animate={{strokeDashoffset: offset}}
                    transition={{duration: 1, ease: "easeInOut"}}
                />
            </svg>

            {showPercentage && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {Math.round(progress)}%
                    </span>
                </div>
            )}
        </div>
    );
};

ProgressRing.propTypes = {
    progress: PropTypes.number.isRequired,
    size: PropTypes.number,
    strokeWidth: PropTypes.number,
    color: PropTypes.oneOf(["blue", "green", "purple", "orange", "red"]),
    showPercentage: PropTypes.bool,
    className: PropTypes.string,
};

export default ProgressRing;