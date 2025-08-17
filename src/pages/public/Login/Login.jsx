// src/pages/public/Login/ModernLogin.jsx
import {useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../hooks/useAuth";
import {Input, Button} from "../../../components/ui";
import {courseService} from "../../../services/course/courseService";
import {expDateAPI} from "../../../services/api/apiService";
import {appStorage} from "../../../utils/storage";
import {ERROR_MESSAGES} from "../../../utils/constants";
import {validators} from "../../../utils/validators";

const ModernLogin = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const {login} = useAuth();

	const syncUserProgress = async () => {
		try {
			const progressData = await courseService.getUserProgress();
			courseService.syncProgressWithLocalStorage(progressData);
		} catch (error) {
			console.warn("Error syncing user progress:", error);
		}
	};

	const loadExpDates = async () => {
		try {
			const expDatesData = await expDateAPI.getExpDates();
			appStorage.setExpDates(expDatesData);
			return expDatesData;
		} catch (error) {
			console.warn("Error loading exp dates:", error);
			appStorage.setExpDates([]);
			return [];
		}
	};

	const handleInputChange = (e) => {
		const {name, value} = e.target;
		setFormData((prev) => ({...prev, [name]: value}));
		if (error) setError(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		// Validaciones
		if (!formData.email.trim() || !formData.password.trim()) {
			setError("Email y contraseña son requeridos");
			return;
		}

		const emailValidation = validators.email(formData.email);
		if (!emailValidation.isValid) {
			setError(emailValidation.error);
			return;
		}

		setLoading(true);

		try {
			const result = await login({
				email: formData.email.trim(),
				password: formData.password.trim(),
			});

			if (!result.success) {
				setError(result.error || ERROR_MESSAGES.INVALID_CREDENTIALS);
				return;
			}

			// Cargar datos adicionales
			try {
				await Promise.all([loadExpDates(), syncUserProgress()]);
			} catch (dataError) {
				console.warn("Error loading additional data:", dataError);
			}

			// Redirigir
			if (result.passwordChangeRequired) {
				navigate("/change-password");
			} else {
				const userData = appStorage.getUser();
				if (userData && parseInt(userData.role) === 1) {
					navigate("/admin/dashboard");
				} else {
					navigate("/estudiante/dashboard");
				}
			}
		} catch (error) {
			console.error("Login error:", error);
			let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;

			if (error.message) {
				errorMessage = error.message;
			} else if (error.response?.data?.message) {
				errorMessage = error.response.data.message;
			} else if (error.response?.data?.error) {
				errorMessage = error.response.data.error;
			}

			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const features = [
		{
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
						d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
					/>
				</svg>
			),
			title: "Cursos Tech de Vanguardia",
			description:
				"Accede a programas educativos en tecnología, desarrollo web, IA y marketing digital.",
		},
		{
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
						d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
					/>
				</svg>
			),
			title: "Certificaciones Globales",
			description:
				"Obtén certificados reconocidos internacionalmente que validan tus habilidades tech.",
		},
		{
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
			title: "Aprendizaje Flexible",
			description: "Estudia a tu ritmo, 24/7, y construye las habilidades que demanda el mercado tech.",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
			{/* Left Side - Features */}
			<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
				{/* Background Pattern */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-900" />
				<div className="absolute inset-0 bg-black/20" />

				{/* Animated Background Shapes */}
				<motion.div
					animate={{
						scale: [1, 1.2, 1],
						rotate: [0, 90, 0],
					}}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: "linear",
					}}
					className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
				/>
				<motion.div
					animate={{
						scale: [1.2, 1, 1.2],
						rotate: [90, 0, 90],
					}}
					transition={{
						duration: 15,
						repeat: Infinity,
						ease: "linear",
					}}
					className="absolute bottom-20 right-20 w-48 h-48 bg-secondary-300/20 rounded-full blur-xl"
				/>

				{/* Content */}
				<div className="relative z-10 flex flex-col justify-center p-12 text-white">
					<motion.div
						initial={{opacity: 0, y: 20}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.6}}
					>
						{/* Logo */}
						<div className="flex items-center space-x-3 mb-12">
							<img 
								src="/logo.png" 
								alt="VanguardIA" 
								className="h-18"
							/>
						</div>

						<h2 className="text-4xl font-bold mb-6 leading-tight">
							Tu futuro tecnológico comienza en
							<span className="block bg-gradient-to-r from-acent-500 to-green-300 bg-clip-text text-transparent">
								VanguardIA
							</span>
						</h2>

						<p className="text-xl text-primary-100 mb-12 leading-relaxed">
							Únete a miles de profesionales que han transformado sus carreras con nuestros 
							cursos especializados en tecnología e innovación digital.
						</p>

						{/* Features */}
						<div className="space-y-6">
							{features.map((feature, index) => (
								<motion.div
									key={index}
									initial={{opacity: 0, x: -20}}
									animate={{opacity: 1, x: 0}}
									transition={{duration: 0.5, delay: 0.3 + index * 0.1}}
									className="flex items-start space-x-4"
								>
									<div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
										{feature.icon}
									</div>
									<div>
										<h3 className="font-semibold text-lg mb-1">
											{feature.title}
										</h3>
										<p className="text-primary-100 leading-relaxed">
											{feature.description}
										</p>
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				</div>
			</div>

			{/* Right Side - Login Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-8">
				<motion.div
					initial={{opacity: 0, y: 20}}
					animate={{opacity: 1, y: 0}}
					transition={{duration: 0.6}}
					className="w-full max-w-md"
				>
					{/* Mobile Logo */}
					<div className="lg:hidden flex items-center justify-center mb-8">
						<div className="flex items-center space-x-3">
							<img 
								src="/logo.png" 
								alt="VanguardIA" 
								className="h-[60px] object-contain"
							/>
							
						</div>
					</div>

					{/* Form */}
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
						<div className="text-center mb-8">
							<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
								¡Bienvenido de vuelta!
							</h2>
							<p className="text-gray-600 dark:text-gray-400">
								Continúa tu journey tecnológico y accede a todos tus cursos
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-6">
							<Input
								type="email"
								name="email"
								label="Correo electrónico"
								value={formData.email}
								onChange={handleInputChange}
								placeholder="tu.email@gmail.com"
								disabled={loading}
								leftIcon={
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
											d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
										/>
									</svg>
								}
								required
							/>

							<Input
								type={showPassword ? "text" : "password"}
								name="password"
								label="Contraseña"
								value={formData.password}
								onChange={handleInputChange}
								placeholder="••••••••"
								disabled={loading}
								leftIcon={
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
											d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
										/>
									</svg>
								}
								rightIcon={
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
									>
										{showPassword ? (
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
													d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.121 14.121l1.414 1.414M14.121 14.121L18 18"
												/>
											</svg>
										) : (
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
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												/>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												/>
											</svg>
										)}
									</button>
								}
								required
							/>

							<AnimatePresence>
								{error && (
									<motion.div
										initial={{opacity: 0, y: -10}}
										animate={{opacity: 1, y: 0}}
										exit={{opacity: 0, y: -10}}
										className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
									>
										<div className="flex items-center space-x-2">
											<svg
												className="w-5 h-5 text-red-500"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											<p className="text-sm text-red-700 dark:text-red-400">
												{error}
											</p>
										</div>
									</motion.div>
								)}
							</AnimatePresence>

							<Button
								type="submit"
								variant="acent"
								size="lg"
								fullWidth
								loading={loading}
								disabled={loading}
								className="mt-8"
							>
								{loading ? "Verificando acceso..." : "Acceder a mis Cursos"}
							</Button>
						</form>

						{/* Footer */}
						<div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
							<div className="mb-2">
								¿Necesitas ayuda?{" "}
								<a
									href="mailto:soporte@vanguardia.edu"
									className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors font-medium"
								>
									Contáctanos aquí
								</a>
							</div>
							<a
								href="/home"
								className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors font-medium"
							>
								← Volver al inicio
							</a>
						</div>
					</div>

					{/* Loading Animation */}
					<AnimatePresence>
						{loading && (
							<motion.div
								initial={{opacity: 0}}
								animate={{opacity: 1}}
								exit={{opacity: 0}}
								className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
							>
								<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl">
									<div className="flex items-center space-x-3">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
										<span className="text-gray-900 dark:text-white font-medium">
											Verificando acceso...
										</span>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</div>
		</div>
	);
};

export default ModernLogin;