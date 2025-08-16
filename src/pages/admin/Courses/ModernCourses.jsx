// src/pages/admin/Courses/ModernCourses.jsx
import {useState, useEffect, useCallback} from "react";
import {motion} from "motion/react";
import ModernTemplate from "../../../components/layout/ModernTemplate/ModernTemplate";
import {
	StatsCard,
	ChartCard,
	Table,
	Modal,
	Button,
	Breadcrumbs,
	Input,
	LoadingSpinner,
	ProgressRing,
} from "../../../components/ui";
import {useToast} from "../../../components/ui/Toast/Toast";
import api from "../../../config/api";
import cursos from "../../../utils/cursos";

const ModernCourses = () => {
	const [students, setStudents] = useState([]);
	const [expDates, setExpDates] = useState({});
	const [loading, setLoading] = useState(true);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [newDeadline, setNewDeadline] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const {toast} = useToast();

	const breadcrumbItems = [
		{label: "Dashboard", href: "/admin/dashboard"},
		{label: "Gestión de Cursos"},
	];

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			const [usersResponse, progressResponse, expDatesResponse] =
				await Promise.all([
					api.get("/users"),
					api.get("/progress"),
					api.get("/expdates"),
				]);

			const usersData = usersResponse.data;
			const progressData = progressResponse.data;
			const expDatesData = expDatesResponse.data;

			const nonAdminUsers = usersData.filter((user) => user.role !== "1");

			const studentsWithProgress = nonAdminUsers.map((user) => {
				const progress = calculateProgress(user.id, progressData);
				return {...user, progress};
			});

			const expDatesMap = {};
			expDatesData.forEach((expDate) => {
				expDatesMap[expDate.curso_id] = expDate.dead_line;
			});

			setStudents(studentsWithProgress);
			setExpDates(expDatesMap);

			await createMissingExpDates(expDatesMap);
		} catch (error) {
			console.error("Error fetching data:", error);
			toast.error("Error al cargar los datos de cursos");
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const createMissingExpDates = async (expDatesMap) => {
		const newExpDates = {...expDatesMap};
		const defaultDeadline = "2027-08-07";

		for (let curso of cursos) {
			if (!newExpDates[curso.id]) {
				try {
					const response = await api.post("/expdates", {
						curso_id: curso.id,
						dead_line: defaultDeadline,
					});
					newExpDates[curso.id] = response.data.dead_line;
				} catch (error) {
					if (error.response?.status !== 409) {
						console.error(
							`Error creating expdate for curso_id ${curso.id}:`,
							error
						);
					}
				}
			}
		}
		setExpDates(newExpDates);
	};

	const calculateProgress = (userId, progressData) => {
		const cursosCompletados = [];
		cursos.forEach((curso) => {
			const unidadesCurso = curso.units.length;
			const unidadesCompletadas = progressData.filter(
				(progress) =>
					parseInt(progress.user_id) === userId &&
					parseInt(progress.course_id) === curso.id &&
					progress.completed === "1"
			).length;

			if (unidadesCompletadas === unidadesCurso) {
				cursosCompletados.push(curso.title);
			}
		});
		return cursosCompletados;
	};

	const handleEditClick = (curso) => {
		setSelectedCourse(curso);
		setNewDeadline(expDates[curso.id] || "");
		setShowEditModal(true);
	};

	const handleUpdateDeadline = async () => {
		if (!selectedCourse) return;

		try {
			await api.put(`/expdates/curso/${selectedCourse.id}`, {
				dead_line: newDeadline,
			});

			setExpDates((prev) => ({
				...prev,
				[selectedCourse.id]: newDeadline,
			}));

			setShowEditModal(false);
			toast.success("Fecha límite actualizada exitosamente");
		} catch (error) {
			console.error("Error updating deadline:", error);
			toast.error("Error al actualizar la fecha límite");
		}
	};

	const getCourseStats = (courseId) => {
		const courseName = cursos[courseId]?.title;
		const studentsFinished = students.filter((student) =>
			student.progress.includes(courseName)
		);
		const studentsInProgress = students.length - studentsFinished.length;
		const completionRate =
			students.length > 0
				? (studentsFinished.length / students.length) * 100
				: 0;

		return {
			studentsFinished: studentsFinished.length,
			studentsInProgress: studentsInProgress,
			completionRate: completionRate,
		};
	};

	const getStatusBadge = (finished, total) => {
		if (total === 0) {
			return (
				<span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
					Sin estudiantes
				</span>
			);
		}

		if (finished === total) {
			return (
				<span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
					Todos completaron
				</span>
			);
		}

		return (
			<span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
				{finished} / {total}
			</span>
		);
	};

	const filteredCourses = cursos.filter(
		(curso) =>
			curso.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			curso.type.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const columns = [
		{
			key: "id",
			title: "#",
			render: (value, row, index) => (
				<span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
					{index + 1}
				</span>
			),
		},
		{
			key: "img",
			title: "Imagen",
			sortable: false,
			render: (value, row) => (
				<div className="flex justify-center">
					<img
						src={row.img}
						alt={row.title}
						className="w-12 h-12 object-cover rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
					/>
				</div>
			),
		},
		{
			key: "title",
			title: "Curso",
			render: (value, row) => (
				<div>
					<p className="font-medium text-gray-900 dark:text-white">{value}</p>
					<p className="text-sm text-gray-500 dark:text-gray-400">{row.type}</p>
				</div>
			),
		},
		{
			key: "studentsFinished",
			title: "Estudiantes Finalizados",
			render: (value, row) => {
				const stats = getCourseStats(row.id);
				return getStatusBadge(stats.studentsFinished, students.length);
			},
		},
		{
			key: "studentsInProgress",
			title: "En Progreso",
			render: (value, row) => {
				const stats = getCourseStats(row.id);
				return getStatusBadge(stats.studentsInProgress, students.length);
			},
		},
		{
			key: "deadline",
			title: "Fecha Límite",
			render: (value, row) => {
				const deadline = expDates[row.id];
				if (!deadline) return "Sin fecha";

				const deadlineDate = new Date(deadline);
				const currentDate = new Date();
				const isExpired = currentDate > deadlineDate;

				return (
					<span
						className={`text-sm ${
							isExpired
								? "text-red-600 dark:text-red-400"
								: "text-gray-900 dark:text-white"
						}`}
					>
						{new Date(deadline).toLocaleDateString()}
					</span>
				);
			},
		},
		{
			key: "completion",
			title: "Progreso",
			render: (value, row) => {
				const stats = getCourseStats(row.id);
				return (
					<div className="flex items-center space-x-2">
						<ProgressRing
							progress={stats.completionRate}
							size={32}
							strokeWidth={4}
							color="blue"
							showPercentage={false}
						/>
						<span className="text-sm text-gray-600 dark:text-gray-400">
							{Math.round(stats.completionRate)}%
						</span>
					</div>
				);
			},
		},
		{
			key: "actions",
			title: "Acciones",
			sortable: false,
			render: (value, row) => (
				<Button
					variant="outline"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						handleEditClick(row);
					}}
					leftIcon={
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
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
					}
				>
					Editar
				</Button>
			),
		},
	];

	// Calculate overall stats
	const totalCourses = cursos.length;
	const totalStudents = students.length;
	const totalCompletions = students.reduce(
		(acc, student) => acc + student.progress.length,
		0
	);
	const avgCompletionRate =
		totalStudents > 0
			? (totalCompletions / (totalStudents * totalCourses)) * 100
			: 0;

	const statsData = [
		{
			title: "Total Cursos",
			value: totalCourses,
			icon: (
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
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
					/>
				</svg>
			),
			color: "blue",
		},
		{
			title: "Total Estudiantes",
			value: totalStudents,
			icon: (
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
						d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
					/>
				</svg>
			),
			color: "green",
		},
		{
			title: "Completaciones Totales",
			value: totalCompletions,
			icon: (
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
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
			color: "purple",
		},
		{
			title: "Tasa de Finalización",
			value: `${Math.round(avgCompletionRate)}%`,
			icon: (
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
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
			),
			color: "orange",
		},
	];

	if (loading) {
		return (
			<ModernTemplate rol="admin" title="Gestión de Cursos">
				<div className="flex items-center justify-center h-64">
					<LoadingSpinner size="lg" />
				</div>
			</ModernTemplate>
		);
	}

	return (
		<ModernTemplate rol="admin" title="Gestión de Cursos">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<Breadcrumbs items={breadcrumbItems} />
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
							Gestión de Cursos
						</h1>
						<p className="text-gray-600 dark:text-gray-400 mt-1">
							Administra los cursos y su progreso
						</p>
					</div>

					<div className="flex items-center space-x-3">
						<Input
							placeholder="Buscar cursos..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							leftIcon={
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
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							}
							className="w-64"
						/>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					{statsData.map((stat, index) => (
						<motion.div
							key={index}
							initial={{opacity: 0, y: 20}}
							animate={{opacity: 1, y: 0}}
							transition={{delay: index * 0.1}}
						>
							<StatsCard {...stat} />
						</motion.div>
					))}
				</div>

				{/* Course Progress Overview */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{cursos.slice(0, 3).map((curso, index) => {
						const stats = getCourseStats(curso.id);
						return (
							<motion.div
								key={index}
								initial={{opacity: 0, y: 20}}
								animate={{opacity: 1, y: 0}}
								transition={{delay: index * 0.1}}
							>
								<ChartCard
									title={curso.title}
									subtitle={`${curso.units.length} lecciones`}
								>
									<div className="flex items-center justify-center space-x-8">
										<div className="text-center">
											<ProgressRing
												progress={stats.completionRate}
												size={80}
												color="blue"
											/>
											<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
												Finalización General
											</p>
										</div>
										<div className="space-y-2">
											<div className="flex items-center space-x-2">
												<div className="w-3 h-3 bg-green-500 rounded-full"></div>
												<span className="text-sm">
													Completados: {stats.studentsFinished}
												</span>
											</div>
											<div className="flex items-center space-x-2">
												<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
												<span className="text-sm">
													En progreso: {stats.studentsInProgress}
												</span>
											</div>
										</div>
									</div>
								</ChartCard>
							</motion.div>
						);
					})}
				</div>

				{/* Courses Table */}
				<Table
					data={filteredCourses}
					columns={columns}
					searchable={false}
					sortable={true}
					pagination={true}
					itemsPerPage={10}
				/>

				{/* Edit Deadline Modal */}
				<Modal
					isOpen={showEditModal}
					onClose={() => setShowEditModal(false)}
					title={`Editar fecha límite - ${selectedCourse?.title}`}
					size="md"
				>
					{selectedCourse && (
						<div className="space-y-4">
							<div>
								<p className="text-gray-600 dark:text-gray-400 mb-4">
									Establece la fecha límite para el curso{" "}
									<strong>{selectedCourse.title}</strong>
								</p>
								<Input
									type="date"
									label="Fecha límite"
									value={newDeadline}
									onChange={(e) => setNewDeadline(e.target.value)}
									required
								/>
							</div>
							<div className="flex space-x-3 pt-4">
								<Button
									variant="outline"
									fullWidth
									onClick={() => setShowEditModal(false)}
								>
									Cancelar
								</Button>
								<Button
									variant="primary"
									fullWidth
									onClick={handleUpdateDeadline}
									disabled={!newDeadline}
								>
									Actualizar
								</Button>
							</div>
						</div>
					)}
				</Modal>
			</div>
		</ModernTemplate>
	);
};

export default ModernCourses;