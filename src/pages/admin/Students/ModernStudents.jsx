// src/pages/admin/Students/ModernStudents.jsx
import {useState, useEffect, useCallback} from "react";
import {motion} from "motion/react";
import {saveAs} from "file-saver";
import {PDFDownloadLink} from "@react-pdf/renderer";
import dayjs from "dayjs";
import ModernTemplate from "../../../components/layout/ModernTemplate/ModernTemplate";
import {
	StatsCard,
	Table,
	Modal,
	Button,
	Breadcrumbs,
	Card,
	LoadingSpinner,
} from "../../../components/ui";
import {useToast} from "../../../components/ui/Toast/Toast";
import CertificatePDF from "../../../features/courses/components/Certificate/CertificatePDF";
import api from "../../../config/api";
import cursos from "../../../utils/cursos";

const ModernStudents = () => {
	const [students, setStudents] = useState([]);
	const [filteredStudents, setFilteredStudents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedStudent, setSelectedStudent] = useState(null);
	const [showStudentModal, setShowStudentModal] = useState(false);
	const [filterType, setFilterType] = useState("all");
	const {toast} = useToast();

	const breadcrumbItems = [
		{label: "Dashboard", href: "/admin/dashboard"},
		{label: "Gestión de Estudiantes"},
	];

	const fetchStudentsData = useCallback(async () => {
		try {
			setLoading(true);
			const [studentsResponse, progressResponse] = await Promise.all([
				api.get("/users"),
				api.get("/progress"),
			]);

			const allUsers = studentsResponse.data;
			const progressData = progressResponse.data;

			const studentsOnly = allUsers.filter((user) => user.role !== "1");

			const studentsWithProgress = studentsOnly.map((student) => {
				const {completed, inProgress, courseDetails} = calculateProgress(
					student.id,
					progressData
				);
				return {
					...student,
					coursesCompleted: completed,
					coursesInProgress: inProgress,
					courseDetails,
				};
			});

			setStudents(studentsWithProgress);
		} catch (error) {
			console.error("Error fetching students data:", error);
			toast.error("Error al cargar los datos de estudiantes");
		} finally {
			setLoading(false);
		}
	}, [toast]);

	const applyFilter = useCallback(() => {
		let filtered = students;

		switch (filterType) {
			case "completed":
				filtered = students.filter(
					(student) => student.coursesCompleted === cursos.length
				);
				break;
			case "inProgress":
				filtered = students.filter(
					(student) => student.coursesCompleted < cursos.length
				);
				break;
			default:
				filtered = students;
		}

		setFilteredStudents(filtered);
	}, [students, filterType]);

	useEffect(() => {
		fetchStudentsData();
	}, [fetchStudentsData]);

	useEffect(() => {
		applyFilter();
	}, [applyFilter]);

	const calculateProgress = (userId, progressData) => {
		const totalCourses = cursos.length;
		let coursesCompleted = 0;
		let coursesInProgress = 0;
		const courseDetails = [];

		cursos.forEach((curso) => {
			const courseUnits = curso.units.length;
			const completedUnits = progressData.filter((progress) => {
				const isCompleted =
					progress.completed === true || parseInt(progress.completed) === 1;
				return (
					parseInt(progress.user_id) === userId &&
					parseInt(progress.course_id) === curso.id &&
					isCompleted
				);
			}).length;

			if (completedUnits === courseUnits) {
				coursesCompleted++;
			} else if (completedUnits > 0) {
				coursesInProgress++;
			}

			const courseProgress = progressData.filter(
				(progress) =>
					parseInt(progress.user_id) === userId &&
					parseInt(progress.course_id) === curso.id
			);

			if (courseProgress.length > 0) {
				const finishDate =
					completedUnits === courseUnits
						? courseProgress.reduce((maxDate, progress) => {
								const progressDate = dayjs(progress.finishDate);
								return progressDate.isAfter(maxDate) ? progressDate : maxDate;
						}, dayjs(courseProgress[0].finishDate))
						: null;

				const totalScore = courseProgress.reduce(
					(sum, progress) => sum + parseFloat(progress.score || 0),
					0
				);
				const averageScore = (totalScore / courseProgress.length).toFixed(2);

				courseDetails.push({
					course_id: curso.id,
					courseName: curso.title,
					created_at: courseProgress[0].created_at,
					finishDate: finishDate ? finishDate.format("YYYY-MM-DD") : null,
					score: averageScore,
					certificate: parseInt(courseProgress[0].certificate || 0),
					completed: completedUnits === courseUnits,
					progress: (completedUnits / courseUnits) * 100,
				});
			}
		});

		return {
			completed: coursesCompleted,
			inProgress: coursesInProgress,
			total: totalCourses,
			courseDetails,
		};
	};

	const handleGenerateReminders = () => {
		try {
			const incompleteStudents = students.filter(
				(student) => student.coursesCompleted < cursos.length
			);
			const emails = incompleteStudents
				.map((student) => student.email)
				.join(",\n");

			const blob = new Blob([emails], {type: "text/plain;charset=utf-8"});
			saveAs(blob, "recordatorios_estudiantes.txt");
			toast.success("Archivo de recordatorios generado exitosamente");
		} catch (error) {
			console.error("Error generating reminders:", error);
			toast.error("Error al generar el archivo de recordatorios");
		}
	};

	const handleGenerateReport = () => {
		try {
			const csvHeader =
				"ID;CI;Nombre;Email;Telefono;Curso;Iniciado;Finalizado;Puntuacion;Certificado;Progreso\n";
			const csvRows = filteredStudents
				.map((student) => {
					if (student.courseDetails.length === 0) {
						return `${student.id};${student.ci};${student.name};${student.email};${student.phone};N/A;N/A;N/A;N/A;N/A;N/A`;
					} else {
						return student.courseDetails
							.map((course) => {
								const certificateStatus =
									course.certificate === 1 ? "Descargado" : "N/A";
								return `${student.id};${student.ci};${student.name};${
									student.email
								};${student.phone};${course.courseName};${dayjs(
									course.created_at
								).format("DD/MM/YYYY")};${
									course.finishDate
										? dayjs(course.finishDate).format("DD/MM/YYYY")
										: "En progreso"
								};${
									course.score
								};${certificateStatus};${course.progress.toFixed(2)}%`;
							})
							.join("\n");
					}
				})
				.join("\n");

			const csvContent = csvHeader + csvRows;
			const blob = new Blob([csvContent], {type: "text/csv;"});
			saveAs(blob, "reporte_estudiantes.csv");
			toast.success("Reporte CSV generado exitosamente");
		} catch (error) {
			console.error("Error generating report:", error);
			toast.error("Error al generar el reporte");
		}
	};

	const updateCertificate = async (userId, courseId) => {
		try {
			await api.post("/progress/update-certificate", {
				user_id: userId,
				course_id: courseId,
				certificate: 1,
			});
		} catch (error) {
			console.error("Error updating certificate:", error);
		}
	};

	const getStatusBadge = (completed, total) => {
		if (completed === total) {
			return (
				<span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
					Todos los cursos
				</span>
			);
		} else if (completed > 0) {
			return (
				<span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
					{completed} / {total}
				</span>
			);
		} else {
			return (
				<span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
					Sin completar
				</span>
			);
		}
	};

	const columns = [
		{
			key: "id",
			title: "ID",
			render: (value) => (
				<span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
					#{value}
				</span>
			),
		},
		{
			key: "name",
			title: "Estudiante",
			render: (value, student) => (
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
						<span className="text-white font-medium text-sm">
							{value?.charAt(0)?.toUpperCase() || "E"}
						</span>
					</div>
					<div>
						<p className="font-medium text-gray-900 dark:text-white">{value}</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{student.email}
						</p>
					</div>
				</div>
			),
		},
		{
			key: "ci",
			title: "Cédula",
			render: (value) => <span className="font-mono text-sm">{value}</span>,
		},
		{
			key: "phone",
			title: "Teléfono",
			render: (value) => <span className="text-sm">{value}</span>,
		},
		{
			key: "coursesCompleted",
			title: "Cursos Completados",
			render: (value, student) =>
				getStatusBadge(value, student.courseDetails.length || cursos.length),
		},
		{
			key: "coursesInProgress",
			title: "En Progreso",
			render: (value) => {
				const total = cursos.length;
				if (value === 0) {
					return (
						<span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
							Ninguno
						</span>
					);
				}
				return (
					<span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
						{value} / {total}
					</span>
				);
			},
		},
	];

	const statsData = [
		{
			title: "Total Estudiantes",
			value: students.length,
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
			color: "blue",
		},
		{
			title: "Cursos Completados",
			value: students.filter((s) => s.coursesCompleted === cursos.length)
				.length,
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
			color: "green",
		},
		{
			title: "En Progreso",
			value: students.filter(
				(s) => s.coursesCompleted > 0 && s.coursesCompleted < cursos.length
			).length,
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
		{
			title: "Sin Comenzar",
			value: students.filter((s) => s.coursesCompleted === 0).length,
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
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
			color: "red",
		},
	];

	if (loading) {
		return (
			<ModernTemplate rol="admin" title="Gestión de Estudiantes">
				<div className="flex items-center justify-center h-64">
					<LoadingSpinner size="lg" />
				</div>
			</ModernTemplate>
		);
	}

	return (
		<ModernTemplate rol="admin" title="Gestión de Estudiantes">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<Breadcrumbs items={breadcrumbItems} />
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
							Gestión de Estudiantes
						</h1>
						<p className="text-gray-600 dark:text-gray-400 mt-1">
							Administra el progreso y certificaciones de los estudiantes
						</p>
					</div>

					<div className="flex items-center space-x-3">
						<Button
							variant="outline"
							onClick={handleGenerateReminders}
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
										d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
							}
						>
							Recordatorios
						</Button>
						<Button
							variant="primary"
							onClick={handleGenerateReport}
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
										d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							}
						>
							Generar Reporte
						</Button>
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

				{/* Filters */}
				<Card padding="sm">
					<div className="flex items-center space-x-4">
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							Filtrar por:
						</span>
						<div className="flex space-x-2">
							<Button
								variant={filterType === "all" ? "primary" : "outline"}
								size="sm"
								onClick={() => setFilterType("all")}
							>
								Todos ({students.length})
							</Button>
							<Button
								variant={filterType === "completed" ? "primary" : "outline"}
								size="sm"
								onClick={() => setFilterType("completed")}
							>
								Completados (
								{
									students.filter((s) => s.coursesCompleted === cursos.length)
										.length
								}
								)
							</Button>
							<Button
								variant={filterType === "inProgress" ? "primary" : "outline"}
								size="sm"
								onClick={() => setFilterType("inProgress")}
							>
								En Progreso (
								{
									students.filter(
										(s) =>
											s.coursesCompleted > 0 &&
											s.coursesCompleted < cursos.length
									).length
								}
								)
							</Button>
						</div>
					</div>
				</Card>

				{/* Students Table */}
				<Table
					data={filteredStudents}
					columns={columns}
					searchable={true}
					sortable={true}
					pagination={true}
					itemsPerPage={10}
					onRowClick={(student) => {
						setSelectedStudent(student);
						setShowStudentModal(true);
					}}
					className="cursor-pointer"
				/>

				{/* Student Detail Modal */}
				<Modal
					isOpen={showStudentModal}
					onClose={() => setShowStudentModal(false)}
					title={`Detalles de ${selectedStudent?.name}`}
					size="xl"
				>
					{selectedStudent && (
						<div className="space-y-6">
							{/* Student Info */}
							<div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
									<span className="text-white font-bold text-xl">
										{selectedStudent.name?.charAt(0)?.toUpperCase()}
									</span>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
										{selectedStudent.name}
									</h3>
									<p className="text-gray-600 dark:text-gray-400">
										{selectedStudent.email}
									</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										CI: {selectedStudent.ci}
									</p>
								</div>
							</div>

							{/* Course Progress */}
							<div>
								<h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
									Progreso de Cursos
								</h4>
								
								{/* Scroll container for courses */}
								<div className="max-h-96 overflow-y-auto pr-2 space-y-4">
									{selectedStudent.courseDetails?.length > 0 ? (
										<div className="grid grid-cols-1 gap-4">
											{selectedStudent.courseDetails.map((course, index) => {
												// Find course info from cursos array
												const courseInfo = cursos.find(c => c.id === course.course_id);
												
												return (
													<Card key={index} padding="md" className="border-l-4 border-l-blue-500">
														<div className="flex items-start space-x-4">
															{/* Course Image */}
															<div className="flex-shrink-0">
																<img
																	src={courseInfo?.img || '/placeholder-course.png'}
																	alt={course.courseName}
																	className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
																	onError={(e) => {
																		e.target.src = '/placeholder-course.png';
																	}}
																/>
															</div>
															
															{/* Course Details */}
															<div className="flex-1 min-w-0">
																<div className="flex items-start justify-between">
																	<div className="flex-1">
																		<h5 className="font-medium text-gray-900 dark:text-white mb-2">
																			{course.courseName}
																		</h5>
																		<div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
																			<div>
																				<p className="flex items-center space-x-2">
																					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
																					</svg>
																					<span>Iniciado: {dayjs(course.created_at).format("DD/MM/YYYY")}</span>
																				</p>
																				<p className="flex items-center space-x-2 mt-1">
																					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
																					</svg>
																					<span>Finalizado: {course.finishDate ? dayjs(course.finishDate).format("DD/MM/YYYY") : "En progreso"}</span>
																				</p>
																			</div>
																			<div>
																				<p className="flex items-center space-x-2">
																					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
																					</svg>
																					<span>Puntuación: {course.score}</span>
																				</p>
																				<p className="flex items-center space-x-2 mt-1">
																					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
																					</svg>
																					<span>Certificado: {course.certificate === 1 ? "Descargado" : "Pendiente"}</span>
																				</p>
																			</div>
																		</div>
																	</div>
																	
																	{/* Download Certificate Button */}
																	{course.completed && course.finishDate && (
																		<div className="flex-shrink-0 ml-4">
																			<PDFDownloadLink
																				document={
																					<CertificatePDF
																						name={selectedStudent.name}
																						ci={selectedStudent.ci}
																						course={course.courseName}
																						description=""
																						dateFinal={course.finishDate}
																						calification={parseFloat(course.score)}
																					/>
																				}
																				fileName={`Certificado_${selectedStudent.name}_${course.courseName}.pdf`}
																				onClick={() =>
																					updateCertificate(
																						selectedStudent.id,
																						course.course_id
																					)
																				}
																			>
																				{({loading}) =>
																					loading ? (
																						<LoadingSpinner size="sm" />
																					) : (
																						<Button size="sm" variant="outline" className="h-fit">
																							<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
																							</svg>
																							Certificado
																						</Button>
																					)
																				}
																			</PDFDownloadLink>
																		</div>
																	)}
																</div>
																
																{/* Progress Bar */}
																<div className="mt-4">
																	<div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
																		<span>Progreso del curso</span>
																		<span>{course.progress.toFixed(1)}%</span>
																	</div>
																	<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
																		<div
																			className={`h-2 rounded-full transition-all duration-300 ${
																				course.progress === 100 
																					? 'bg-green-600' 
																					: course.progress > 0 
																						? 'bg-blue-600' 
																						: 'bg-gray-400'
																			}`}
																			style={{width: `${course.progress}%`}}
																		></div>
																	</div>
																</div>
															</div>
														</div>
													</Card>
												);
											})}
										</div>
									) : (
										<div className="text-center py-8">
											<svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
											</svg>
											<p className="text-gray-500 dark:text-gray-400">
												Este estudiante aún no ha comenzado ningún curso
											</p>
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</Modal>
			</div>
		</ModernTemplate>
	);
};

export default ModernStudents;