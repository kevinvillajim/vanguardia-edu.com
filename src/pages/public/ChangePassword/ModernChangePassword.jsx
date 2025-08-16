// src/pages/public/ChangePassword/ModernChangePassword.jsx
import {useState} from "react";
import {motion, AnimatePresence} from "motion/react";
import {useNavigate} from "react-router-dom";
import api from "../../../config/api";
import {Button, Input, Card} from "../../../components/ui";
import {validationRules} from "../../../utils/validation";

const ModernChangePassword = () => {
	const [formData, setFormData] = useState({
		newPassword: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [showPasswords, setShowPasswords] = useState({
		new: false,
		confirm: false,
	});
	const navigate = useNavigate();

	const validateForm = () => {
		const newErrors = {};

		// Validate new password
		const passwordValidation = validationRules.passwordStrength()(
			formData.newPassword
		);
		if (passwordValidation) {
			newErrors.newPassword = passwordValidation;
		}

		// Validate confirmation
		const confirmValidation = validationRules.matchField(
			"newPassword",
			"Las contraseñas no coinciden"
		)(formData.confirmPassword, formData);
		if (confirmValidation) {
			newErrors.confirmPassword = confirmValidation;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (e) => {
		const {name, value} = e.target;
		setFormData((prev) => ({...prev, [name]: value}));

		// Clear specific error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({...prev, [name]: ""}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			await api.post("/auth/change-password", {
				password: formData.newPassword,
				confirmation: formData.confirmPassword,
			});

			// Success animation and redirect
			navigate("/estudiante/dashboard");
		} catch (error) {
			setErrors({
				submit:
					error.response?.data?.message || "Error al cambiar la contraseña",
			});
		} finally {
			setLoading(false);
		}
	};

	const togglePasswordVisibility = (field) => {
		setShowPasswords((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
			{/* Background Elements */}
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
				className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
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
				className="absolute bottom-20 right-20 w-48 h-48 bg-purple-200/30 rounded-full blur-xl"
			/>

			<motion.div
				initial={{opacity: 0, y: 20}}
				animate={{opacity: 1, y: 0}}
				transition={{duration: 0.6}}
				className="w-full max-w-md relative z-10"
			>
				<Card className="p-8">
					{/* Header */}
					<div className="text-center mb-8">
						<motion.div
							initial={{scale: 0}}
							animate={{scale: 1}}
							transition={{delay: 0.2, type: "spring", stiffness: 200}}
							className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
						>
							<svg
								className="w-8 h-8 text-white"
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
						</motion.div>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
							Cambiar Contraseña
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Bienvenido a la plataforma educativa de Cooprogreso
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
							Por favor establece una nueva contraseña segura
						</p>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<Input
								type={showPasswords.new ? "text" : "password"}
								name="newPassword"
								label="Nueva Contraseña"
								value={formData.newPassword}
								onChange={handleInputChange}
								placeholder="••••••••"
								error={errors.newPassword}
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
										onClick={() => togglePasswordVisibility("new")}
										className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
									>
										{showPasswords.new ? (
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
								helper="Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números"
								required
							/>
						</div>

						<div>
							<Input
								type={showPasswords.confirm ? "text" : "password"}
								name="confirmPassword"
								label="Confirmar Contraseña"
								value={formData.confirmPassword}
								onChange={handleInputChange}
								placeholder="••••••••"
								error={errors.confirmPassword}
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
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								}
								rightIcon={
									<button
										type="button"
										onClick={() => togglePasswordVisibility("confirm")}
										className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
									>
										{showPasswords.confirm ? (
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
						</div>

						{/* Submit Error */}
						<AnimatePresence>
							{errors.submit && (
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
											{errors.submit}
										</p>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Submit Button */}
						<Button
							type="submit"
							variant="primary"
							size="lg"
							fullWidth
							loading={loading}
							disabled={loading}
							className="mt-8"
						>
							{loading ? "Cambiando..." : "Cambiar Contraseña"}
						</Button>
					</form>

					{/* Security Tips */}
					<motion.div
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						transition={{delay: 0.5}}
						className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
					>
						<h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
							💡 Consejos de seguridad:
						</h4>
						<ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
							<li>• Usa al menos 8 caracteres</li>
							<li>• Incluye mayúsculas y minúsculas</li>
							<li>• Agrega números y símbolos</li>
							<li>• Evita información personal</li>
						</ul>
					</motion.div>
				</Card>
			</motion.div>
		</div>
	);
};

export default ModernChangePassword;
