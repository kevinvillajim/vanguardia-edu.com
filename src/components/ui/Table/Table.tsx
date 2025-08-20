// src/components/ui/Table/Table.jsx
import {useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import Button from "@/shared/components/ui/Button/Button";
import Pagination from "../Navigation/Pagination";
import PropTypes from "prop-types";

const Table = ({
	data = [],
	columns = [],
	loading = false,
	pagination = true,
	itemsPerPage = 10,
	searchable = true,
	sortable = true,
	selectable = false,
	actions = [],
	onRowClick,
	className = "",
}) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [sortConfig, setSortConfig] = useState({key: null, direction: "asc"});
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRows, setSelectedRows] = useState(new Set());

    const getNestedValue = (obj, path) => {
			return path.split(".").reduce((current, key) => current?.[key], obj);
    };
    
	// Filtrar datos por búsqueda
	const filteredData = data.filter((row) =>
		columns.some((column) => {
			const value = getNestedValue(row, column.key);
			return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
		})
	);

	// Ordenar datos
	const sortedData = [...filteredData].sort((a, b) => {
		if (!sortConfig.key) return 0;

		const aValue = getNestedValue(a, sortConfig.key);
		const bValue = getNestedValue(b, sortConfig.key);

		if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
		if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
		return 0;
	});

	// Paginación
	const totalPages = Math.ceil(sortedData.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedData = pagination
		? sortedData.slice(startIndex, startIndex + itemsPerPage)
		: sortedData;

	const handleSort = (key) => {
		if (!sortable) return;

		setSortConfig((prevConfig) => ({
			key,
			direction:
				prevConfig.key === key && prevConfig.direction === "asc"
					? "desc"
					: "asc",
		}));
	};

	const handleSelectRow = (rowId) => {
		const newSelected = new Set(selectedRows);
		if (newSelected.has(rowId)) {
			newSelected.delete(rowId);
		} else {
			newSelected.add(rowId);
		}
		setSelectedRows(newSelected);
	};

	const handleSelectAll = () => {
		if (selectedRows.size === paginatedData.length) {
			setSelectedRows(new Set());
		} else {
			setSelectedRows(new Set(paginatedData.map((row) => row.id)));
		}
	};

	const renderCell = (row, column) => {
		const value = getNestedValue(row, column.key);

		if (column.render) {
			return column.render(value, row);
		}

		return value;
	};

	if (loading) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
				<div className="animate-pulse space-y-4">
					<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg"
						></div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
		>
			{/* Header with Search */}
			{searchable && (
				<div className="p-6 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<div className="relative">
							<input
								type="text"
								placeholder="Buscar..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<svg
								className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>

						{selectedRows.size > 0 && (
							<div className="flex items-center space-x-2">
								<span className="text-sm text-gray-600 dark:text-gray-400">
									{selectedRows.size} seleccionados
								</span>
								{actions.map((action, index) => (
									<Button
										key={index}
										variant={action.variant || "secondary"}
										size="sm"
										onClick={() => action.onClick(Array.from(selectedRows))}
										leftIcon={action.icon}
									>
										{action.label}
									</Button>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="bg-gray-50 dark:bg-gray-700/50">
							{selectable && (
								<th className="w-12 px-6 py-4 text-left">
									<input
										type="checkbox"
										checked={
											selectedRows.size === paginatedData.length &&
											paginatedData.length > 0
										}
										onChange={handleSelectAll}
										className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
									/>
								</th>
							)}
							{columns.map((column) => (
								<th
									key={column.key}
									className={`px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
										sortable && column.sortable !== false
											? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
											: ""
									}`}
									onClick={() =>
										sortable &&
										column.sortable !== false &&
										handleSort(column.key)
									}
								>
									<div className="flex items-center space-x-1">
										<span>{column.title}</span>
										{sortable && column.sortable !== false && (
											<div className="flex flex-col">
												<svg
													className={`w-3 h-3 ${
														sortConfig.key === column.key &&
														sortConfig.direction === "asc"
															? "text-blue-600"
															: "text-gray-400"
													}`}
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z"
														clipRule="evenodd"
													/>
												</svg>
												<svg
													className={`w-3 h-3 -mt-1 ${
														sortConfig.key === column.key &&
														sortConfig.direction === "desc"
															? "text-blue-600"
															: "text-gray-400"
													}`}
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
										)}
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
						<AnimatePresence>
							{paginatedData.map((row, index) => (
								<motion.tr
									key={row.id || index}
									initial={{opacity: 0, y: 20}}
									animate={{opacity: 1, y: 0}}
									exit={{opacity: 0, y: -20}}
									transition={{duration: 0.2, delay: index * 0.05}}
									className={`
                    hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                    ${onRowClick ? "cursor-pointer" : ""}
                    ${
											selectedRows.has(row.id)
												? "bg-blue-50 dark:bg-blue-900/20"
												: ""
										}
                  `}
									onClick={() => onRowClick?.(row)}
								>
									{selectable && (
										<td className="px-6 py-4">
											<input
												type="checkbox"
												checked={selectedRows.has(row.id)}
												onChange={() => handleSelectRow(row.id)}
												onClick={(e) => e.stopPropagation()}
												className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
											/>
										</td>
									)}
									{columns.map((column) => (
										<td
											key={column.key}
											className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${
												column.className || ""
											}`}
										>
											{renderCell(row, column)}
										</td>
									))}
								</motion.tr>
							))}
						</AnimatePresence>
					</tbody>
				</table>
			</div>

			{/* Empty State */}
			{paginatedData.length === 0 && !loading && (
				<div className="text-center py-12">
					<svg
						className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
						/>
					</svg>
					<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
						No hay datos disponibles
					</h3>
					<p className="text-gray-500 dark:text-gray-400">
						{searchTerm
							? "No se encontraron resultados para tu búsqueda."
							: "Aún no hay información para mostrar."}
					</p>
				</div>
			)}

			{/* Pagination */}
			{pagination && totalPages > 1 && (
				<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={filteredData.length}
						itemsPerPage={itemsPerPage}
						onPageChange={setCurrentPage}
					/>
				</div>
			)}
		</div>
	);
};

Table.propTypes = {
	data: PropTypes.array.isRequired,
	columns: PropTypes.arrayOf(
		PropTypes.shape({
			key: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired,
			render: PropTypes.func,
			sortable: PropTypes.bool,
			className: PropTypes.string,
		})
	).isRequired,
	loading: PropTypes.bool,
	pagination: PropTypes.bool,
	itemsPerPage: PropTypes.number,
	searchable: PropTypes.bool,
	sortable: PropTypes.bool,
	selectable: PropTypes.bool,
	actions: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			onClick: PropTypes.func.isRequired,
			icon: PropTypes.node,
			variant: PropTypes.string,
		})
	),
	onRowClick: PropTypes.func,
	className: PropTypes.string,
};



export default Table;
