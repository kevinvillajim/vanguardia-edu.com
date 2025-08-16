// src/components/layout/Header/PublicHeader.jsx
import {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {motion, AnimatePresence} from "motion/react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import {Button} from "../../ui";
import ThemeToggle from "../../ui/ThemeToggle";

const PublicHeader = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const location = useLocation();

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
						<Link to="/login" className="hidden sm:block">
							<Button variant="acent" size="sm">
								Iniciar Sesión
							</Button>
						</Link>

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
								<Link
									to="/login"
									className="block w-full"
									onClick={() => setIsMenuOpen(false)}
								>
									<Button variant="acent" size="sm" fullWidth>
										Iniciar Sesión
									</Button>
								</Link>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.nav>
	);
};

export default PublicHeader;