// src/pages/admin/Dashboard/ModernDashboard.jsx
import {useEffect, useState, useCallback} from "react";
import {motion} from "motion/react";
import ModernTemplate from "../../../components/layout/ModernTemplate/ModernTemplate";
import StatsCard from "../../../components/ui/Dashboard/StatsCard";
import ChartCard from "../../../components/ui/Dashboard/ChartCard";
import ProgressRing from "../../../components/ui/Dashboard/ProgressRing";
import ActivityFeed from "../../../components/ui/Dashboard/ActivityFeed";
import Button from "@/shared/components/ui/Button/Button";
import {LineChart} from "@mui/x-charts";
import cursos from "../../../utils/cursos";
import api from "../../../config/api";

const ModernDashboard = () => {
	const [stats, setStats] = useState({
		totalStudents: 0,
		activeCourses: 0,
		completedCourses: 0,
		totalCertificates: 0,
	});
	const [loading, setLoading] = useState(true);
	const [pieChartData, setPieChartData] = useState([]);
	const [lineChartData, setLineChartData] = useState([]);
	const [recentActivity, setRecentActivity] = useState([]);
	const [view, setView] = useState("all"); // all, active, completed
	const [selectedCourse, setSelectedCourse] = useState("all"); // para filtros por curso
	const [users, setUsers] = useState([]);
	const [progressData, setProgressData] = useState([]);

	const fetchDashboardData = useCallback(async () => {
		try {
			setLoading(true);

			const [usersResponse, progressResponse] = await Promise.all([
				api.get("/users"),
				api.get("/progress"),
			]);

			const allUsers = usersResponse.data.filter((user) => user.role !== "1");
			const progress = progressResponse.data;

			setUsers(allUsers);
			setProgressData(progress);

			// Calculate stats
			const totalStudents = allUsers.length;
			const activeCourses = cursos.length;

			// Calculate completed courses
			let completedCourses = 0;
			allUsers.forEach((user) => {
				cursos.forEach((curso) => {
					const userProgress = progress.filter(
						(p) =>
							parseInt(p.user_id) === user.id &&
							parseInt(p.course_id) === curso.id
					);
					const completedUnits = userProgress.filter(
						(p) => p.completed === "1"
					).length;
					if (completedUnits === curso.units.length) {
						completedCourses++;
					}
				});
			});

			const totalCertificates = progress.filter(
				(p) => p.certificate === "1"
			).length;

			setStats({
				totalStudents,
				activeCourses,
				completedCourses,
				totalCertificates,
			});

			// Mock recent activity
			const activity = [
				{
					id: 1,
					type: "user_joined",
					message: "Nuevo estudiante se registró",
					time: "hace 2 horas",
				},
				{
					id: 2,
					type: "course_completed",
					message: "Juan Pérez completó el curso de Seguridad",
					time: "hace 4 horas",
				},
				{
					id: 3,
					type: "certificate_earned",
					message: "María García obtuvo su certificado",
					time: "hace 1 día",
				},
			];
			setRecentActivity(activity);
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	const updateCharts = useCallback(() => {
		// Helper function to get filtered courses
		const getFilteredCourses = () => {
			switch (view) {
				case "active":
					// Courses that have students currently working on them
					return cursos.filter(curso => {
						return users.some(user => {
							const userProgress = progressData.filter(
								p => parseInt(p.user_id) === user.id && parseInt(p.course_id) === curso.id
							);
							const completedUnits = userProgress.filter(p => p.completed === "1").length;
							return completedUnits > 0 && completedUnits < curso.units.length;
						});
					});
				case "completed":
					// Courses that have at least one student who completed them
					return cursos.filter(curso => {
						return users.some(user => {
							const userProgress = progressData.filter(
								p => parseInt(p.user_id) === user.id && parseInt(p.course_id) === curso.id
							);
							const completedUnits = userProgress.filter(p => p.completed === "1").length;
							return completedUnits === curso.units.length;
						});
					});
				default:
					return cursos;
			}
		};

		// Helper function to calculate monthly scores
		const calculateMonthlyScores = () => {
			const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
			const monthlyData = months.map((month, index) => {
				// Calculate average scores for this month
				const monthProgress = progressData.filter(p => {
					const progressDate = new Date(p.created_at);
					return progressDate.getMonth() === index;
				});

				let totalScore = 0;
				let count = 0;
				
				if (selectedCourse === "all") {
					monthProgress.forEach(p => {
						if (p.score) {
							totalScore += parseFloat(p.score);
							count++;
						}
					});
				} else {
					monthProgress.filter(p => parseInt(p.course_id) === parseInt(selectedCourse)).forEach(p => {
						if (p.score) {
							totalScore += parseFloat(p.score);
							count++;
						}
					});
				}

				return {
					month,
					average: count > 0 ? (totalScore / count) : 0
				};
			});

			return monthlyData;
		};

		const filteredCourses = getFilteredCourses();
		
		// Update pie chart data
		let totalCompleted = 0;
		let totalInProgress = 0;
		let totalNotStarted = 0;

		const selectedCourses = selectedCourse === "all" ? filteredCourses : [cursos.find(c => c.id === parseInt(selectedCourse))];

		users.forEach((user) => {
			selectedCourses.forEach((curso) => {
				if (!curso) return;
				
				const userProgress = progressData.filter(
					(p) =>
						parseInt(p.user_id) === user.id &&
						parseInt(p.course_id) === curso.id
				);
				const completedUnits = userProgress.filter(
					(p) => p.completed === "1"
				).length;
				const totalUnits = curso.units.length;

				if (completedUnits === 0) {
					totalNotStarted++;
				} else if (completedUnits === totalUnits) {
					totalCompleted++;
				} else {
					totalInProgress++;
				}
			});
		});

		const pieData = [
			{id: 0, value: totalCompleted, label: "Completados"},
			{id: 1, value: totalInProgress, label: "En Progreso"},
			{id: 2, value: totalNotStarted, label: "No Iniciados"},
		];
		setPieChartData(pieData);

		// Generate scores/grades chart by month
		const monthlyScores = calculateMonthlyScores();
		setLineChartData(monthlyScores);
	}, [users, progressData, view, selectedCourse]);

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	useEffect(() => {
		if (users.length > 0 && progressData.length > 0) {
			updateCharts();
		}
	}, [users.length, progressData.length, updateCharts]);

	const statsCards = [
		{
			title: "Total Estudiantes",
			value: stats.totalStudents,
			change: "+12%",
			changeType: "positive",
			icon: (
				<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
				</svg>
			),
			color: "blue",
		},
		{
			title: "Cursos Activos",
			value: stats.activeCourses,
			change: "+2",
			changeType: "positive",
			icon: (
				<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
				</svg>
			),
			color: "green",
		},
		{
			title: "Cursos Completados",
			value: stats.completedCourses,
			change: "+25%",
			changeType: "positive",
			icon: (
				<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
			color: "purple",
		},
		{
			title: "Certificados Emitidos",
			value: stats.totalCertificates,
			change: "+18%",
			changeType: "positive",
			icon: (
				<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
				</svg>
			),
			color: "orange",
		},
	];

	if (loading) {
		return (
			<ModernTemplate rol="admin" title="Dashboard">
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
				</div>
			</ModernTemplate>
		);
	}

	return (
		<ModernTemplate rol="admin" title="Dashboard">
			<div className="space-y-6">
				{/* Welcome Section */}
				<motion.div
					initial={{opacity: 0, y: -20}}
					animate={{opacity: 1, y: 0}}
					className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white"
				>
					<h2 className="text-2xl font-bold mb-2">¡Bienvenido de vuelta!</h2>
					<p className="text-blue-100">
						Aquí tienes un resumen de tu plataforma educativa
					</p>
				</motion.div>

				{/* Filters */}
				<div className="flex flex-wrap gap-4 items-center justify-between">
					<div className="flex gap-2">
						<Button
							variant={view === "all" ? "primary" : "outline"}
							size="sm"
							onClick={() => setView("all")}
						>
							Todos los Cursos
						</Button>
						<Button
							variant={view === "active" ? "primary" : "outline"}
							size="sm"
							onClick={() => setView("active")}
						>
							En Curso
						</Button>
						<Button
							variant={view === "completed" ? "primary" : "outline"}
							size="sm"
							onClick={() => setView("completed")}
						>
							Completados
						</Button>
					</div>

					<div className="flex items-center gap-2">
						<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
							Curso:
						</label>
						<select
							value={selectedCourse}
							onChange={(e) => setSelectedCourse(e.target.value)}
							className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
						>
							<option value="all">Todos</option>
							{cursos.map((curso) => (
								<option key={curso.id} value={curso.id}>
									{curso.title}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{statsCards.map((card, index) => (
						<motion.div
							key={index}
							initial={{opacity: 0, y: 20}}
							animate={{opacity: 1, y: 0}}
							transition={{delay: index * 0.1}}
						>
							<StatsCard {...card} />
						</motion.div>
					))}
				</div>

				{/* Charts Section */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Progress Overview */}
					<ChartCard
						title="Distribución de Progreso"
						subtitle={selectedCourse === "all" ? "Estado de todos los cursos" : `Estado del curso seleccionado`}
					>
						<div className="flex items-center justify-center h-64">
							<div className="flex items-center space-x-8">
								<ProgressRing 
									progress={pieChartData.length > 0 ? Math.round((pieChartData[0].value / (pieChartData[0].value + pieChartData[1].value + pieChartData[2].value)) * 100) : 0} 
									size={120} 
									color="blue" 
								/>
								<div className="space-y-2">
									{pieChartData.map((item, index) => (
										<div key={index} className="flex items-center space-x-2">
											<div className={`w-3 h-3 rounded-full ${
												index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-gray-300'
											}`}></div>
											<span className="text-sm text-gray-600 dark:text-gray-400">
												{item.label}: {item.value}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</ChartCard>

					{/* Monthly Scores */}
					<ChartCard
						title="Promedio de Calificaciones por Mes"
						subtitle={selectedCourse === "all" ? "Todas las materias" : "Materia seleccionada"}
					>
						<div className="h-64">
							<LineChart
								xAxis={[
									{data: lineChartData.map((d) => d.month), scaleType: "point"},
								]}
								series={[
									{
										data: lineChartData.map((d) => d.average),
										label: "Promedio",
										color: "#3b82f6",
									},
								]}
								height={240}
							/>
						</div>
					</ChartCard>
				</div>

				{/* Recent Activity and Quick Actions */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Recent Activity */}
					<div className="lg:col-span-2">
						<ChartCard
							title="Actividad Reciente"
							subtitle="Últimas acciones en la plataforma"
						>
							<ActivityFeed activities={recentActivity} />
						</ChartCard>
					</div>

					{/* Quick Actions */}
					<div className="space-y-4">
						<ChartCard title="Acciones Rápidas" subtitle="Acciones comunes">
							<div className="space-y-3">
								<Button
									variant="outline"
									fullWidth
									leftIcon={
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
										</svg>
									}
								>
									Nuevo Usuario
								</Button>
								<Button
									variant="outline"
									fullWidth
									leftIcon={
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
										</svg>
									}
								>
									Nuevo Curso
								</Button>
								<Button
									variant="outline"
									fullWidth
									leftIcon={
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
										</svg>
									}
								>
									Ver Reportes
								</Button>
								<Button
									variant="primary"
									fullWidth
									leftIcon={
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
										</svg>
									}
								>
									Exportar Datos
								</Button>
							</div>
						</ChartCard>
					</div>
				</div>
			</div>
		</ModernTemplate>
	);
};

export default ModernDashboard;