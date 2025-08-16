import {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

function Header() {
	const [menuOpen, setMenuOpen] = useState(false);
	const location = useLocation();

	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
	};

	const navigationItems = [
		{label: "Inicio", path: "/"},
		{label: "Cursos", path: "/cursos"},
		{label: "Acerca de", path: "/acerca-de"},
		{label: "Contacto", path: "/contacto"}
	];

	const isActive = (path) => {
		if (path === "/") {
			return location.pathname === "/" || location.pathname === "/home";
		}
		return location.pathname === path;
	};

	return (
		<>
			<div className="py-[1.5rem] px-[2rem] bg-primary-500 shadow-lg">
				<div className="w-full flex justify-between items-center">
					<Link to="/" className="w-[200px] md:w-[300px] h-[auto]">
						<img src="logo.png" alt="VanguardIA" className="w-[100%] h-[100%] filter brightness-0 invert" />
					</Link>
					<div className="hidden md:flex items-center lista-header">
						<nav className="flex items-center gap-8">
							{navigationItems.map((item) => (
								<Link
									key={item.path}
									to={item.path}
									className={`text-[18px] font-medium transition-all duration-300 hover:text-acent-500 hover:scale-105 ${
										isActive(item.path)
											? "text-acent-500 font-semibold"
											: "text-white"
									}`}
									onClick={() => setMenuOpen(false)}
								>
									{item.label}
								</Link>
							))}
							<Link
								to="/login"
								className="btn btn-acent hover:scale-105 transition-all duration-300 ml-4"
							>
								<span>Iniciar Sesión</span>
							</Link>
						</nav>
					</div>
					<div
						className="md:hidden border-2 border-white p-[0.3rem] rounded-md menu-header text-white hover:bg-white hover:text-primary-500 transition-all duration-300"
						onClick={toggleMenu}
					>
						{menuOpen ? <CloseIcon /> : <MenuIcon />}
					</div>
				</div>
				{menuOpen && (
					<div className="md:hidden flex flex-col items-center mt-[1rem] space-y-4 bg-white/10 backdrop-blur-md rounded-lg p-4">
						{navigationItems.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								className={`text-[18px] font-medium transition-colors duration-300 hover:text-acent-500 ${
									isActive(item.path)
										? "text-acent-500 font-semibold"
										: "text-white"
								}`}
								onClick={() => setMenuOpen(false)}
							>
								{item.label}
							</Link>
						))}
						<Link
							to="/login"
							className="btn btn-acent"
							onClick={() => setMenuOpen(false)}
						>
							Iniciar Sesión
						</Link>
					</div>
				)}
			</div>
		</>
	);
}

export default Header;
