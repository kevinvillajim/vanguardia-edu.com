// src/pages/Profile/ModernProfile.jsx
import {motion} from "motion/react";
import {Card, Button} from "../../components/ui";
import ModernTemplate from "../../components/layout/ModernTemplate/ModernTemplate";
import {getFromLocalStorage} from "../../utils/crypto";

const ModernProfile = () => {
	const user = JSON.parse(getFromLocalStorage("user"));

	const profileSections = [
		{
			label: "Foto",
			value: (
				<div className="flex items-center space-x-3">
					<img
						className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-900"
						src={user.avatar || "/avatarDef.png"}
						alt="profile"
					/>
					<div className="text-sm text-gray-500 dark:text-gray-400">
						<p>Imagen de perfil actual</p>
						<p className="text-xs">JPG, PNG o GIF (máx. 5MB)</p>
					</div>
				</div>
			),
		},
		{
			label: "Nombre",
			value: user.name,
			icon: (
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
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
			),
		},
		{
			label: "CI",
			value: user.ci,
			icon: (
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
						d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
					/>
				</svg>
			),
		},
		{
			label: "Bio",
			value: user.bio || "Sin información",
			icon: (
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
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			),
		},
		{
			label: "Teléfono",
			value: user.phone,
			icon: (
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
						d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
					/>
				</svg>
			),
		},
		{
			label: "Email",
			value: user.email,
			icon: (
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
						d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
					/>
				</svg>
			),
		},
		{
			label: "Contraseña",
			value: "••••••••••",
			icon: (
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
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
			),
		},
	];

	return (
		<ModernTemplate
			rol={parseInt(user.role) === 1 ? "admin" : "Estudiante"}
			title="Mi Perfil"
		>
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
				<motion.div
					initial={{opacity: 0, y: -20}}
					animate={{opacity: 1, y: 0}}
					className="text-center"
				>
					<div className="relative inline-block mb-4">
						<motion.img
							initial={{scale: 0}}
							animate={{scale: 1}}
							transition={{type: "spring", stiffness: 200}}
							className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-900 mx-auto"
							src={user.avatar || "/avatarDef.png"}
							alt="profile"
						/>
						<div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
							<svg
								className="w-4 h-4 text-white"
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
						</div>
					</div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						{user.name}
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mb-2">
						{parseInt(user.role) === 1 ? "Administrador" : "Estudiante"}
					</p>
					<div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
						<span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
						Cuenta Activa
					</div>
				</motion.div>

				{/* Profile Information Card */}
				<Card className="overflow-hidden">
					<div className="bg-gradient-to-r from-green-900 to-green-500 px-6 py-4">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-xl font-bold text-white mb-1">
									Información Personal
								</h2>
								<p className="text-blue-100 text-sm">
									Mantén tu información actualizada para garantizar la precisión
									de tus certificados
								</p>
							</div>
							<Button
								variant="secondary"
								size="sm"
								className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
								onClick={() => (window.location.href = "/edit-profile")}
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
						</div>
					</div>

					<div className="p-6">
						<div className="grid gap-6">
							{profileSections.map((section, index) => (
								<motion.div
									key={section.label}
									initial={{opacity: 0, x: -20}}
									animate={{opacity: 1, x: 0}}
									transition={{delay: index * 0.1}}
									className="flex items-start justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
								>
									<div className="flex items-center space-x-3">
										{section.icon && (
											<div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400">
												{section.icon}
											</div>
										)}
										<div>
											<p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
												{section.label}
											</p>
										</div>
									</div>
									<div className="flex-1 ml-4 text-right">
										{typeof section.value === "string" ? (
											<p className="text-gray-900 dark:text-white font-medium">
												{section.value}
											</p>
										) : (
											section.value
										)}
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</Card>

				{/* Security Section */}
				<motion.div
					initial={{opacity: 0, y: 20}}
					animate={{opacity: 1, y: 0}}
					transition={{delay: 0.3}}
				>
					<Card>
						<div className="p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center space-x-3">
									<div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
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
												d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
											/>
										</svg>
									</div>
									<div>
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
											Seguridad de la Cuenta
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											Gestiona la seguridad de tu cuenta
										</p>
									</div>
								</div>
							</div>

							<div className="grid gap-4">
								<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
									<div className="flex items-center space-x-3">
										<div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
											<svg
												className="w-4 h-4 text-green-600 dark:text-green-400"
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
										</div>
										<div>
											<p className="font-medium text-gray-900 dark:text-white">
												Contraseña
											</p>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												Última actualización hace 30 días
											</p>
										</div>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => (window.location.href = "/edit-profile")}
									>
										Cambiar
									</Button>
								</div>

								<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
									<div className="flex items-center space-x-3">
										<div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
											<svg
												className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
										<div>
											<p className="font-medium text-gray-900 dark:text-white">
												Email verificado
											</p>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												{user.email}
											</p>
										</div>
									</div>
									<div className="flex items-center text-green-600 dark:text-green-400">
										<svg
											className="w-4 h-4 mr-1"
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
										<span className="text-sm font-medium">Verificado</span>
									</div>
								</div>
							</div>
						</div>
					</Card>
				</motion.div>

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

export default ModernProfile;
