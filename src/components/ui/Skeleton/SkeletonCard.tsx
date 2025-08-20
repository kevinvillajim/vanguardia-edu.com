// src/components/ui/Skeleton/SkeletonCard.jsx
import Skeleton from "./Skeleton";
import PropTypes from "prop-types";

const SkeletonCard = ({ className = "" }) => {
    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 ${className}`}
        >
            <div className="space-y-4">
                {/* Header with avatar and title */}
                <div className="flex items-center space-x-3">
                    <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
                    <div className="space-y-2 flex-1">
                        <Skeleton width="60%" height="1rem" />
                        <Skeleton width="40%" height="0.75rem" />
                    </div>
                </div>

                {/* Content area */}
                <div className="space-y-2">
                    <Skeleton width="100%" height="0.875rem" />
                    <Skeleton width="85%" height="0.875rem" />
                    <Skeleton width="70%" height="0.875rem" />
                </div>

                {/* Action area */}
                <div className="flex items-center justify-between pt-4">
                    <Skeleton width="5rem" height="2rem" className="rounded-lg" />
                    <Skeleton width="3rem" height="1.5rem" />
                </div>
            </div>
        </div>
    );
};

SkeletonCard.propTypes = {
    className: PropTypes.string,
};

export default SkeletonCard