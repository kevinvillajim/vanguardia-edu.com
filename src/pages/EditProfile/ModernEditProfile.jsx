// src/pages/EditProfile/ModernEditProfile.jsx
import {useState, useEffect} from "react";
import {motion, AnimatePresence} from "motion/react";
import api from "../../config/api";
import {Card, Button} from "../../components/ui";
import ModernTemplate from "../../components/layout/ModernTemplate/ModernTemplate";
import {getFromLocalStorage, saveToLocalStorage} from "../../utils/crypto";
import {useToast} from "../../components/ui/Toast/Toast";

const ModernEditProfile = () => {
	const {toast} = useToast();
	const user = JSON.parse(getFromLocalStorage("user"));
	
	const [formData, setFormData] = useState({
		name: "",
		bio: "",
		phone: "",
		email: "",
		password: "",
		photo: "",
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	// Initialize form data only once
	useEffect(() => {
		if (user && formData.name === "") {
			setFormData({
				name: user.name || "",
				bio: user.bio || "",
				phone: user.phone || "",
				email: user.email || "",
				password: "",
				photo: user.avatar || "",
			});
		}
	}, [user, formData.name]);

	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validatePhone = (phone) => {
		if (!phone || phone.length === 0) return true;
		const phoneRegex = /^[+]?[\d\s\-()]{7,15}$/;
		return phoneRegex.test(phone);
	};

	const handleInputChange = (e) => {
		const {name, value} = e.target;
		
		setFormData(prev => ({...prev, [name]: value}));
		setIsDirty(true);
		
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors(prev => ({...prev, [name]: ""}));
		}
	};

	const handlePhotoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validate file type
			const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
			if (!validTypes.includes(file.type)) {
				toast.error("Por favor selecciona una imagen válida (JPG, PNG, GIF)");
				return;
			}

			// Validate file size (5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("La imagen debe ser menor a 5MB");
				return;
			}

			const reader = new FileReader();
			reader.onloadend = () => {
				setFormData(prev => ({...prev, photo: reader.result}));
				setIsDirty(true);
			};
			reader.readAsDataURL(file);
		}
	};

	const validateForm = () => {
		const newErrors = {};

		// Validate required fields
		if (!formData.name.trim()) {
			newErrors.name = "El nombre es requerido";
		} else if (formData.name.trim().length < 2) {
			newErrors.name = "El nombre debe tener al menos 2 caracteres";
		}

		if (!formData.email.trim()) {
			newErrors.email = "El email es requerido";
		} else if (!validateEmail(formData.email)) {
			newErrors.email = "Por favor ingresa un email válido";
		}

		// Validate optional fields
		if (formData.phone && !validatePhone(formData.phone)) {
			newErrors.phone = "Por favor ingresa un teléfono válido";
		}

		if (formData.password && formData.password.length < 6) {
			newErrors.password = "La contraseña debe tener al menos 6 caracteres";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error("Por favor corrige los errores en el formulario");
			return;
		}

		setLoading(true);
		setErrors({});

		try {
			const submitData = {
				name: formData.name,
				bio: formData.bio,
				phone: formData.phone,
				email: formData.email,
			};

			// Only include password if it's being changed
			if (formData.password && formData.password.trim()) {
				submitData.password = formData.password;
			}

			// Only include photo if it's being changed
			if (formData.photo && formData.photo !== user.avatar) {
				submitData.photo = formData.photo;
			}

			const response = await api.post("/edit-profile", submitData);

			if (response.data && response.data.user) {
				saveToLocalStorage("user", JSON.stringify(response.data.user));
				toast.success("Perfil actualizado exitosamente");
				setIsDirty(false);

				// Redirect after success
				setTimeout(() => {
					window.location.href = "/profile";
				}, 1500);
			}
		} catch (error) {
			console.error("Error al actualizar el perfil:", error);
			const errorMessage = error.response?.data?.message || "Error al actualizar el perfil";
			setErrors({ submit: errorMessage });
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		if (isDirty) {
			if (window.confirm("¿Estás seguro? Los cambios no guardados se perderán.")) {
				window.location.href = "/profile";
			}
		} else {
			window.location.href = "/profile";
		}
	};

	if (!user) {
		return (
			<ModernTemplate rol="Estudiante" title="Editar Perfil">
				<div className="flex items-center justify-center h-64">
					<p className="text-gray-500">Cargando perfil...</p>
				</div>
			</ModernTemplate>
		);
	}

	return (
		<ModernTemplate
			rol={parseInt(user.role) === 1 ? "admin" : "Estudiante"}
			title="Editar Perfil"
		>
			<div className="max-w-2xl mx-auto space-y-6">
				{/* Header */}
				<motion.div
					initial={{opacity: 0, y: -20}}
					animate={{opacity: 1, y: 0}}
					className="text-center"
				>
					<div className="flex items-center justify-center space-x-3 mb-4">
						<motion.div
							initial={{scale: 0}}
							animate={{scale: 1}}
							transition={{type: "spring", stiffness: 200}}
							className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
						>
							<svg
								className="w-6 h-6 text-white"
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
						</motion.div>
						<div>
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
								Editar Perfil
							</h1>
						</div>
					</div>
					<p className="text-gray-600 dark:text-gray-400">
						Actualiza tu información personal. Los cambios se reflejarán en toda la plataforma.
					</p>
				</motion.div>

				{/* Form Card */}
				<Card>
					<form onSubmit={handleSubmit} className="p-6 space-y-6">
						{/* Photo Upload */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
								Foto de Perfil
							</label>
							<div className="flex items-center space-x-6">
								<div className="relative">
									<img
										src={formData.photo || "/avatarDef.png"}
										alt="profile"
										className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-200 dark:ring-gray-700"
									/>
									{isDirty && (
										<div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
											<svg
												className="w-3 h-3 text-white"
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
										</div>
									)}
								</div>
								<div className="flex-1">
									<input
										type="file"
										accept="image/jpeg,image/png,image/gif"
										onChange={handlePhotoChange}
										disabled={loading}
										className="block w-full text-sm text-gray-500 dark:text-gray-400
											file:mr-4 file:py-2 file:px-4
											file:rounded-lg file:border-0
											file:text-sm file:font-medium
											file:bg-blue-50 file:text-blue-700
											hover:file:bg-blue-100
											dark:file:bg-blue-900/20 dark:file:text-blue-400
											dark:hover:file:bg-blue-900/30
											cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
									/>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										JPG, PNG o GIF (máx. 5MB)
									</p>
								</div>
							</div>
						</div>

						{/* Form Fields */}
						<div className="grid gap-6">
							{/* Name Field */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Nombre Completo *
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<svg
											className="w-5 h-5 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											/>
										</svg>
									</div>
									<input
										type="text"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										placeholder="Ingresa tu nombre completo"
										disabled={loading}
										className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
											focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
											dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400
											disabled:opacity-50 disabled:cursor-not-allowed"
									/>
								</div>
								{errors.name && (
									<p className="text-red-500 text-xs mt-1">{errors.name}</p>
								)}
							</div>

							{/* Bio Field */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Biografía
								</label>
								<textarea
									name="bio"
									value={formData.bio}
									onChange={handleInputChange}
									placeholder="Cuéntanos sobre ti..."
									disabled={loading}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
										focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
										dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400
										disabled:opacity-50 disabled:cursor-not-allowed"
								/>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Opcional: Una breve descripción sobre ti
								</p>
							</div>

							{/* Phone Field */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Teléfono
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<svg
											className="w-5 h-5 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
											/>
										</svg>
									</div>
									<input
										type="tel"
										name="phone"
										value={formData.phone}
										onChange={handleInputChange}
										placeholder="+593 99 123 4567"
										disabled={loading}
										className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
											focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
											dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400
											disabled:opacity-50 disabled:cursor-not-allowed"
									/>
								</div>
								{errors.phone && (
									<p className="text-red-500 text-xs mt-1">{errors.phone}</p>
								)}
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Formato: +593 99 123 4567
								</p>
							</div>

							{/* Email Field */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Correo Electrónico *
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<svg
											className="w-5 h-5 text-gray-400"
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
									</div>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleInputChange}
										placeholder="tu@email.com"
										disabled={loading}
										className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
											focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
											dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400
											disabled:opacity-50 disabled:cursor-not-allowed"
									/>
								</div>
								{errors.email && (
									<p className="text-red-500 text-xs mt-1">{errors.email}</p>
								)}
							</div>

							{/* Password Field */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Nueva Contraseña
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<svg
											className="w-5 h-5 text-gray-400"
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
									</div>
									<input
										type={showPassword ? "text" : "password"}
										name="password"
										value={formData.password}
										onChange={handleInputChange}
										placeholder="Dejar en blanco para mantener la actual"
										disabled={loading}
										className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
											focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
											dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400
											disabled:opacity-50 disabled:cursor-not-allowed"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
								</div>
								{errors.password && (
									<p className="text-red-500 text-xs mt-1">{errors.password}</p>
								)}
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Solo llénalo si quieres cambiar tu contraseña
								</p>
							</div>
						</div>

						{/* Error Message */}
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

						{/* Action Buttons */}
						<div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
								disabled={loading}
								fullWidth
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
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								variant="primary"
								loading={loading}
								disabled={loading || !isDirty}
								fullWidth
								leftIcon={
									loading ? null : (
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
												d="M5 13l4 4L19 7"
											/>
										</svg>
									)
								}
							>
								{loading ? "Guardando..." : "Guardar Cambios"}
							</Button>
						</div>
					</form>
				</Card>

				{/* Dirty State Indicator */}
				<AnimatePresence>
					{isDirty && (
						<motion.div
							initial={{opacity: 0, y: 20}}
							animate={{opacity: 1, y: 0}}
							exit={{opacity: 0, y: 20}}
							className="fixed bottom-6 right-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 shadow-lg"
						>
							<div className="flex items-center space-x-2">
								<svg
									className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
								<p className="text-sm text-yellow-700 dark:text-yellow-400">
									Tienes cambios sin guardar
								</p>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Footer */}
				<motion.div
					initial={{opacity: 0}}
					animate={{opacity: 1}}
					transition={{delay: 0.5}}
					className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 pt-6"
				>
					<div>
						<p>Creado por</p>
						<a
							href="https://kevinvillajim.github.io/Portfolio/"
							className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors"
							target="_blank"
							rel="noopener noreferrer"
						>
							kevinvillajim
						</a>
					</div>
					<div className="text-right">
						<div>Sinergy Hard ©</div>
						<div>Esparta Agencia Creativa ©</div>
					</div>
				</motion.div>
			</div>
		</ModernTemplate>
	);
};

export default ModernEditProfile;