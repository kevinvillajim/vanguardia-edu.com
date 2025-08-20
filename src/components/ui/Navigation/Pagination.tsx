// src/components/ui/Navigation/Pagination.jsx
import {motion} from "framer-motion";
import PropTypes from "prop-types";

const Pagination = ({
	currentPage,
	totalPages,
	onPageChange,
	showInfo = true,
	totalItems = 0,
	itemsPerPage = 10,
	className = "",
}) => {
	const getVisiblePages = () => {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		for (
			let i = Math.max(2, currentPage - delta);
			i <= Math.min(totalPages - 1, currentPage + delta);
			i++
		) {
			range.push(i);
		}

		if (currentPage - delta > 2) {
			rangeWithDots.push(1, "...");
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push("...", totalPages);
		} else {
			if (totalPages > 1) {
				rangeWithDots.push(totalPages);
			}
		}

		return rangeWithDots;
	};

	const handlePageChange = (page) => {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			onPageChange(page);
		}
	};

	const visiblePages = getVisiblePages();
	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);

	return (
		<div className={`flex items-center justify-between ${className}`}>
			{/* Info */}
			{showInfo && (
				<div className="text-sm text-gray-700 dark:text-gray-300">
					Mostrando <span className="font-medium">{startItem}</span> a{" "}
					<span className="font-medium">{endItem}</span> de{" "}
					<span className="font-medium">{totalItems}</span> resultados
				</div>
			)}

			{/* Pagination */}
			<div className="flex items-center space-x-1">
				{/* Previous Button */}
				<motion.button
					whileHover={{scale: 1.05}}
					whileTap={{scale: 0.95}}
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className={`
            p-2 rounded-lg border transition-colors
            ${
							currentPage === 1
								? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
								: "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
						}
          `}
				>
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
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</motion.button>

				{/* Page Numbers */}
				<div className="flex items-center space-x-1">
					{visiblePages.map((page, index) => (
						<motion.button
							key={index}
							whileHover={page !== "..." ? {scale: 1.05} : {}}
							whileTap={page !== "..." ? {scale: 0.95} : {}}
							onClick={() => page !== "..." && handlePageChange(page)}
							disabled={page === "..." || page === currentPage}
							className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
									page === currentPage
										? "bg-blue-600 text-white"
										: page === "..."
										? "text-gray-400 dark:text-gray-600 cursor-default"
										: "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
								}
              `}
						>
							{page}
						</motion.button>
					))}
				</div>

				{/* Next Button */}
				<motion.button
					whileHover={{scale: 1.05}}
					whileTap={{scale: 0.95}}
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className={`
            p-2 rounded-lg border transition-colors
            ${
							currentPage === totalPages
								? "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
								: "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
						}
          `}
				>
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
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</motion.button>
			</div>
		</div>
	);
};

Pagination.propTypes = {
	currentPage: PropTypes.number.isRequired,
	totalPages: PropTypes.number.isRequired,
	onPageChange: PropTypes.func.isRequired,
	showInfo: PropTypes.bool,
	totalItems: PropTypes.number,
	itemsPerPage: PropTypes.number,
	className: PropTypes.string,
};

export default Pagination;