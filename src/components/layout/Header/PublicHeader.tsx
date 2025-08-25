// src/components/layout/Header/PublicHeader.jsx
import {useState, useEffect, useRef} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {motion, AnimatePresence} from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import {Button} from "../../ui/Button/Button";
import ThemeToggle from "../../ui/ThemeToggle";
import { useAuthStore } from "../../../shared/store/authStore";

const PublicHeader = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const { user, isAuthenticated, logout } = useAuthStore();
	const userMenuRef = useRef(null);

	// Close user menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
				setIsUserMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const navigationItems = [
		{label: "Inicio", path: "/"},
		{label: "Cursos", path: "/cursos"},
		{label: "Acerca de", path: "/acerca-de"},
		{label: "Contacto", path: "/contacto"},
	];

	const isActive = (path) => {
		if (path === "/") {
			return location.pathname === "/" || location.pathname === "/home";
		}
		return location.pathname === path;
	};

	const handleLogout = async () => {
		await logout();
		setIsUserMenuOpen(false);
		setIsMenuOpen(false);
		navigate('/');
	};

	const getDashboardPath = () => {
		if (!user) return '/';
		switch (user.role) {
			case 1: return '/admin/control';
			case 3: return '/profesor/dashboard';
			case 2: return '/user/dashboard';
			default: return '/';
		}
	};

	return (
		<motion.nav
			initial={{y: -100}}
			animate={{y: 0}}
			className="fixed top-0 left-0 right-0 z-50 bg-primary-800 shadow-lg"
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link to="/" className="flex items-center space-x-3">
						<img
							src="/logo.png"
							alt="VanguardIA"
							className="h-12 w-auto filter brightness-0 invert"
						/>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-8">
						{navigationItems.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								className={`text-sm font-medium transition-all duration-300 hover:text-acent-500 hover:scale-105 ${
									isActive(item.path)
										? "text-acent-500 font-semibold"
										: "text-white"
								}`}
								onClick={() => setIsMenuOpen(false)}
							>
								{item.label}
							</Link>
						))}
					</div>

					{/* Actions */}
					<div className="flex items-center space-x-4">
						<ThemeToggle />
						{isAuthenticated ? (
							<div ref={userMenuRef} className="hidden sm:block relative">
								<button
									onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
									className="flex items-center space-x-2 p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
								>
									<AccountCircleIcon />
									<span className="text-sm font-medium">{user?.name || user?.email}</span>
								</button>
								
								{isUserMenuOpen && (
									<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
										<Link
											to={getDashboardPath()}
											className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
											onClick={() => setIsUserMenuOpen(false)}
										>
											Mi Dashboard
										</Link>
										<button
											onClick={handleLogout}
											className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
										>
											<LogoutIcon fontSize="small" />
											<span>Cerrar Sesión</span>
										</button>
									</div>
								)}
							</div>
						) : (
							<Link to="/login" className="hidden sm:block">
								<Button variant="acent" size="sm">
									Iniciar Sesión
								</Button>
							</Link>
						)}

						{/* Mobile Menu Button */}
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
						>
							{isMenuOpen ? <CloseIcon /> : <MenuIcon />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Menu */}
			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						initial={{opacity: 0, height: 0}}
						animate={{opacity: 1, height: "auto"}}
						exit={{opacity: 0, height: 0}}
						className="md:hidden bg-white/10 backdrop-blur-md border-t border-white/20"
					>
						<div className="px-4 py-4 space-y-2">
							{navigationItems.map((item) => (
								<Link
									key={item.path}
									to={item.path}
									className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
										isActive(item.path)
											? "text-acent-500 bg-white/20 font-semibold"
											: "text-white hover:bg-white/10"
									}`}
									onClick={() => setIsMenuOpen(false)}
								>
									{item.label}
								</Link>
							))}
							<div className="pt-2">
								{isAuthenticated ? (
									<div className="space-y-2">
										<Link
											to={getDashboardPath()}
											className="block w-full"
											onClick={() => setIsMenuOpen(false)}
										>
											<Button variant="acent" size="sm" fullWidth>
												Mi Dashboard
											</Button>
										</Link>
										<button
											onClick={handleLogout}
											className="w-full px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2"
										>
											<LogoutIcon fontSize="small" />
											<span>Cerrar Sesión</span>
										</button>
									</div>
								) : (
									<Link
										to="/login"
										className="block w-full"
										onClick={() => setIsMenuOpen(false)}
									>
										<Button variant="acent" size="sm" fullWidth>
											Iniciar Sesión
										</Button>
									</Link>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.nav>
	);
};

export default PublicHeader;