// src/components/ui/Skeleton/SkeletonTable.jsx
import Skeleton from "./Skeleton";
import PropTypes from "prop-types";

const SkeletonTable = ({ rows = 5, columns = 4, className = "" }) => {
    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <Skeleton width="8rem" height="2rem" />
                    <Skeleton width="6rem" height="2rem" className="rounded-lg" />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                            {Array.from({length: columns}).map((_, index) => (
                                <th key={index} className="px-6 py-4 text-left">
                                    <Skeleton width="4rem" height="1rem" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Array.from({length: rows}).map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {Array.from({length: columns}).map((_, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4">
                                        <Skeleton
                                            width={
                                                colIndex === 0
                                                    ? "3rem"
                                                    : colIndex === 1
                                                    ? "8rem"
                                                    : "5rem"
                                            }
                                            height="1rem"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

SkeletonTable.propTypes = {
    rows: PropTypes.number,
    columns: PropTypes.number,
    className: PropTypes.string,
};

export default SkeletonTable;