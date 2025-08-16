// src/components/layout/ModernTemplate/ModernTemplate.jsx
import {useState} from "react";
import {motion, AnimatePresence} from "motion/react";
import {useTheme} from "../../../contexts/ThemeContext";
import ThemeToggle from "../../ui/ThemeToggle";
import {getFromLocalStorage} from "../../../utils/crypto";
import {sideBarOptions} from "../../../utils/menuData";
import PropTypes from "prop-types";

const ModernTemplate = ({children, rol, title}) => {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	useTheme();
	const user = JSON.parse(getFromLocalStorage("user"));

	const sidebarVariants = {
		open: {width: "280px", opacity: 1},
		closed: {width: "80px", opacity: 0.9},
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		Object.keys(localStorage).forEach((key) => {
			if (key.startsWith("Course")) {
				localStorage.removeItem(key);
			}
		});
		window.location.href = "/login";
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
			{/* Sidebar */}
			<motion.aside
				initial="open"
				animate={sidebarOpen ? "open" : "closed"}
				variants={sidebarVariants}
				transition={{duration: 0.3, ease: "easeInOut"}}
				className="fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-xl z-40 border-r border-gray-200 dark:border-gray-700"
			>
				<div className="flex flex-col h-full">
					{/* Logo Section */}
					<div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-gray-700">
						<motion.div
							initial={{scale: 0.8, opacity: 0}}
							animate={{scale: 1, opacity: 1}}
							transition={{delay: 0.2}}
							className="flex items-center space-x-3"
						>
							
								
									<img src="/logoSimp.png" alt="Logo" className="w-6 h-6" />
								
							
							<AnimatePresence>
								{sidebarOpen && (
									<motion.div
										initial={{opacity: 0, x: -20}}
										animate={{opacity: 1, x: 0}}
										exit={{opacity: 0, x: -20}}
										transition={{duration: 0.2}}
									>
										<h1 className="text-xl font-bold text-gray-900 dark:text-white">
											Cooprogreso
										</h1>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					</div>

					{/* User Profile */}
					<div className="p-6 border-b border-gray-200 dark:border-gray-700">
						<div className="flex items-center space-x-3">
							<div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center overflow-hidden">
								{user?.avatar ? (
									<img
										src={user.avatar}
										alt={user.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<span className="text-white font-medium text-lg">
										{user?.name?.charAt(0)?.toUpperCase() || "U"}
									</span>
								)}
							</div>
							<AnimatePresence>
								{sidebarOpen && (
									<motion.div
										initial={{opacity: 0, x: -20}}
										animate={{opacity: 1, x: 0}}
										exit={{opacity: 0, x: -20}}
										transition={{duration: 0.2}}
										className="flex-1"
									>
										<p className="text-sm font-medium text-gray-900 dark:text-white">
											{user?.name || "Usuario"}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{rol === "admin" ? "Administrador" : "Estudiante"}
										</p>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 p-4 space-y-2 overflow-y-auto">
						{(sideBarOptions[rol] || []).map((option, index) => (
							<motion.a
								key={index}
								href={option.link}
								initial={{opacity: 0, x: -20}}
								animate={{opacity: 1, x: 0}}
								transition={{delay: index * 0.1}}
								className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
							>
								<div className="w-6 h-6 flex items-center justify-center">
									<span className="material-symbols-outlined text-xl group-hover:text-blue-600 transition-colors">
										{option.icon}
									</span>
								</div>
								<AnimatePresence>
									{sidebarOpen && (
										<motion.span
											initial={{opacity: 0, x: -10}}
											animate={{opacity: 1, x: 0}}
											exit={{opacity: 0, x: -10}}
											transition={{duration: 0.2}}
											className="font-medium"
										>
											{option.name}
										</motion.span>
									)}
								</AnimatePresence>
							</motion.a>
						))}
					</nav>

					{/* Bottom Actions */}
					<div className="p-4 border-t border-gray-200 dark:border-gray-700">
						<div className="flex items-center justify-between">
							<ThemeToggle />
							<motion.button
								whileHover={{scale: 1.05}}
								whileTap={{scale: 0.95}}
								onClick={() => setSidebarOpen(!sidebarOpen)}
								className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							</motion.button>
						</div>
					</div>
				</div>
			</motion.aside>

			{/* Main Content */}
			<div
				className={`transition-all duration-300 ${
					sidebarOpen ? "ml-[280px]" : "ml-[80px]"
				}`}
			>
				{/* Header */}
				<header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
					<div className="flex items-center justify-between h-16 px-6">
						<div className="flex items-center space-x-4">
							<motion.h1
								initial={{opacity: 0, y: -20}}
								animate={{opacity: 1, y: 0}}
								className="text-xl font-semibold text-gray-900 dark:text-white"
							>
								{title || "Dashboard"}
							</motion.h1>
						</div>

						<div className="flex items-center space-x-4">
							{/* Notifications */}
							<motion.button
								whileHover={{scale: 1.05}}
								whileTap={{scale: 0.95}}
								className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
							>
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
										d="M15 17h5l-5-5-5 5h5zm0 0v5"
									/>
								</svg>
								<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
							</motion.button>

							{/* Profile Menu */}
							<div className="relative">
								<motion.button
									whileHover={{scale: 1.05}}
									whileTap={{scale: 0.95}}
									onClick={() => setProfileMenuOpen(!profileMenuOpen)}
									className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
								>
									<div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center overflow-hidden">
										{user?.avatar ? (
											<img
												src={user.avatar}
												alt={user.name}
												className="w-full h-full object-cover"
											/>
										) : (
											<span className="text-white font-medium text-sm">
												{user?.name?.charAt(0)?.toUpperCase() || "U"}
											</span>
										)}
									</div>
									<svg
										className="w-4 h-4 text-gray-500 dark:text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</motion.button>

								{/* Profile Dropdown */}
								<AnimatePresence>
									{profileMenuOpen && (
										<motion.div
											initial={{opacity: 0, y: -10, scale: 0.95}}
											animate={{opacity: 1, y: 0, scale: 1}}
											exit={{opacity: 0, y: -10, scale: 0.95}}
											transition={{duration: 0.2}}
											className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
										>
											<a
												href="/profile"
												className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
											>
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
												<span>Mi Perfil</span>
											</a>
											<hr className="my-1 border-gray-200 dark:border-gray-700" />
											<button
												onClick={handleLogout}
												className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
											>
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
														d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
													/>
												</svg>
												<span>Cerrar Sesión</span>
											</button>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="p-6">
					<motion.div
						initial={{opacity: 0, y: 20}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.3}}
						className="max-w-7xl mx-auto"
					>
						{children}
					</motion.div>
				</main>
			</div>

			{/* Mobile Overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}
		</div>
	);
};

ModernTemplate.propTypes = {
	children: PropTypes.node.isRequired,
	rol: PropTypes.string.isRequired,
	title: PropTypes.string,
};

export default ModernTemplate;
