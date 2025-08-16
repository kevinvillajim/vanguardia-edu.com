// src/App.jsx - App principal actualizado con el nuevo sistema
import {ThemeProvider} from "@mui/material/styles";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import {motion, AnimatePresence} from "framer-motion";

// Contexts
import {AuthProvider} from "./contexts/AuthContext";
import {CourseProvider} from "./contexts/CourseContext";
import {ThemeProvider as CustomThemeProvider} from "./contexts/ThemeContext";
import { ToastProvider } from "./components/ui";


// Layout Components
import {ProtectedRoute, RoleRoute} from "./components/layout";

// Modern Pages
import ModernHome from "./pages/public/Home/ModernHome";
import ModernLogin from "./pages/public/Login/Login";
import CursosPage from "./pages/public/Cursos/Cursos";
import ContactPage from "./pages/public/Contact/Contact";
import About from "./components/layout/About/About";
import ModernAdminDashboard from "./pages/admin/Dashboard/ModernDashboard";
import ModernUsers from "./pages/admin/Users/ModernUsers";
import ModernStudents from "./pages/admin/Students/ModernStudents";
import ModernCourses from "./pages/admin/Courses/ModernCourses";
import ModernStudentDashboard from "./pages/student/Dashboard/ModernStudentDashboard";
import ModernCertificates from "./pages/student/Certificates/ModernCertificates"
import ModernChangePassword from "./pages/public/ChangePassword/ModernChangePassword";
import ModernProfile from "./pages/Profile/ModernProfile";

// Existing Pages (to be modernized)
import ModernCertificateView from "./pages/student/CertificateView/ModernCertificateView";

// Course Components
import Curso1Unidad1 from "./features/courses/components/Units/Course1/Curso1Unidad1";
import Curso1Unidad2 from "./features/courses/components/Units/Course1/Curso1Unidad2";
import Curso1Unidad3 from "./features/courses/components/Units/Course1/Curso1Unidad3";
import Curso2Unidad1 from "./features/courses/components/Units/Course2/Curso2Unidad1";
import Curso2Unidad2 from "./features/courses/components/Units/Course2/Curso2Unidad2";
import Curso2Unidad3 from "./features/courses/components/Units/Course2/Curso2Unidad3";
import Curso3Unidad1 from "./features/courses/components/Units/Course3/Curso3Unidad1";
import Curso3Unidad2 from "./features/courses/components/Units/Course3/Curso3Unidad2";
import Curso3Unidad3 from "./features/courses/components/Units/Course3/Curso3Unidad3";

// Utils
import {VideoProvider} from "./features/courses/components/Video/Video";
import {USER_ROLES} from "./utils/constants";
import theme from "./config/muiTheme";
import ModernEditProfile from "./pages/EditProfile/ModernEditProfile";
import ModernCourseRedirect from "./pages/student/CourseView/ModernCourseRedirect";

// Page Transition Component
import PropTypes from "prop-types";

const PageTransition = ({children}) => (
	<motion.div
		initial={{opacity: 0, y: 20}}
		animate={{opacity: 1, y: 0}}
		exit={{opacity: 0, y: -20}}
		transition={{duration: 0.3}}
	>
		{children}
	</motion.div>
);

PageTransition.propTypes = {
	children: PropTypes.node.isRequired,
};

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CustomThemeProvider>
				<ToastProvider>
					<AuthProvider>
						<CourseProvider>
							<VideoProvider>
								<Router>
									<AnimatePresence mode="wait">
										<Routes>
											{/* Public Routes */}
											<Route
												path="/home"
												element={
													<PageTransition>
														<ModernHome />
													</PageTransition>
												}
											/>
											<Route
												path="/login"
												element={
													<PageTransition>
														<ModernLogin />
													</PageTransition>
												}
											/>
											<Route
												path="/cursos"
												element={
													<PageTransition>
														<CursosPage />
													</PageTransition>
												}
											/>
											<Route
												path="/contacto"
												element={
													<PageTransition>
														<ContactPage />
													</PageTransition>
												}
											/>
											<Route
												path="/acerca-de"
												element={
													<PageTransition>
														<About />
													</PageTransition>
												}
											/>
											<Route
												path="/"
												element={<Navigate to="/home" replace />}
											/>

											{/* Protected Routes */}
											<Route
												path="/change-password"
												element={
													<ProtectedRoute>
														<PageTransition>
															<ModernChangePassword />
														</PageTransition>
													</ProtectedRoute>
												}
											/>

											<Route
												path="/profile"
												element={
													<ProtectedRoute requireActive={true}>
														<PageTransition>
															<ModernProfile />
														</PageTransition>
													</ProtectedRoute>
												}
											/>

											<Route
												path="/edit-profile"
												element={
													<ProtectedRoute requireActive={true}>
														<PageTransition>
															<ModernEditProfile />
														</PageTransition>
													</ProtectedRoute>
												}
											/>

											{/* Admin Routes */}
											<Route
												path="/admin/*"
												element={
													<ProtectedRoute requireActive={true}>
														<RoleRoute
															allowedRoles={[USER_ROLES.ADMIN]}
															redirectPath="/estudiante/dashboard"
														>
															<Routes>
																<Route
																	path="dashboard"
																	element={
																		<PageTransition>
																			<ModernAdminDashboard />
																		</PageTransition>
																	}
																/>
																<Route
																	path="usuarios"
																	element={
																		<PageTransition>
																			<ModernUsers />
																		</PageTransition>
																	}
																/>
																<Route
																	path="alumnos"
																	element={
																		<PageTransition>
																			<ModernStudents />
																		</PageTransition>
																	}
																/>
																<Route
																	path="clases"
																	element={
																		<PageTransition>
																			<ModernCourses />
																		</PageTransition>
																	}
																/>
															</Routes>
														</RoleRoute>
													</ProtectedRoute>
												}
											/>

											{/* Student Routes */}
											<Route
												path="/estudiante/*"
												element={
													<ProtectedRoute requireActive={true}>
														<RoleRoute
															allowedRoles={[USER_ROLES.STUDENT]}
															redirectPath="/admin/dashboard"
														>
															<Routes>
																<Route
																	path="dashboard"
																	element={
																		<PageTransition>
																			<ModernStudentDashboard />
																		</PageTransition>
																	}
																/>

																{/* Course Routes */}
																<Route
																	path="cursos/curso1/unidad1"
																	element={
																		<PageTransition>
																			<Curso1Unidad1 />
																		</PageTransition>
																	}
																/>
																<Route
																	path="cursos/curso1/unidad2"
																	element={
																		<PageTransition>
																			<Curso1Unidad2 />
																		</PageTransition>
																	}
																/>
																<Route
																	path="cursos/curso1/unidad3"
																	element={
																		<PageTransition>
																			<Curso1Unidad3 />
																		</PageTransition>
																	}
																/>
																<Route
																	path="cursos/curso2/unidad1"
																	element={
																		<PageTransition>
																			<Curso2Unidad1 />
																		</PageTransition>
																	}
																/>
																<Route
																	path="cursos/curso2/unidad2"
																	element={
																		<PageTransition>
																			<Curso2Unidad2 />
																		</PageTransition>
																	}
																/>
																<Route
																	path="cursos/curso2/unidad3"
																	element={
																		<PageTransition>
																			<Curso2Unidad3 />
																		</PageTransition>
																	}
																/>
																<Route
												path="cursos/curso3/unidad1"
												element={<Curso3Unidad1 />}
											/>
											<Route
												path="cursos/curso3/unidad2"
												element={<Curso3Unidad2 />}
											/>
											<Route
												path="cursos/curso3/unidad3"
												element={<Curso3Unidad3 />}
											/>

																{/* Certificate Routes */}
																<Route
																	path="certificados"
																	element={
																		<PageTransition>
																			<ModernCertificates />
																		</PageTransition>
																	}
																/>
																<Route
																	path="cursos/curso1/certificado"
																	element={
																		<PageTransition>
																			<ModernCertificateView curso={0} />
																		</PageTransition>
																	}
																/>
																<Route
																	path="cursos/curso2/certificado"
																	element={
																		<PageTransition>
																			<ModernCertificateView curso={1} />
																		</PageTransition>
																	}
																/>
																<Route
												path="cursos/curso3/certificado"
												element={<ModernCertificateView curso={2} />}
											/>

																{/* Course Redirects */}
																<Route
																	path="cursos"
																	element={<ModernCourseRedirect curso={0} />}
																/>
																<Route
																	path="cursos/curso1"
																	element={<ModernCourseRedirect curso={0} />}
																/>
																<Route
																	path="cursos/curso2"
																	element={<ModernCourseRedirect curso={1} />}
																/>

<Route
												path="cursos/curso3"
												element={<ModernCourseRedirect curso={2} />}
											/>
															</Routes>
														</RoleRoute>
													</ProtectedRoute>
												}
											/>

											{/* Fallback Route */}
											<Route
												path="*"
												element={<Navigate to="/home" replace />}
											/>
										</Routes>
									</AnimatePresence>
								</Router>
							</VideoProvider>
						</CourseProvider>
					</AuthProvider>
				</ToastProvider>
			</CustomThemeProvider>
		</ThemeProvider>
	);
}

export default App;
