import {useState} from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

function Header() {
	const [menuOpen, setMenuOpen] = useState(false);

	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
	};

	return (
		<>
			<div className="py-[1.5rem] px-[2rem] bg-[white]">
				<div className="w-full flex justify-between items-center">
					<div className="w-[200px] md:w-[250px] h-[auto]">
						<img src="logo.png" className="w-[100%] h-[100%]" />
					</div>
					<div className="hidden md:flex items-center lista-header">
						<ul className="flex gap-10 cursor-pointer text-[black] text-[20px]">
							<li className="flex items-center">Inicio</li>
							<a href="/login" className="flex items-center">
								<li className="flex items-center">Cursos</li>
							</a>
							<a href="/login">
								<li className="p-[0.5rem] px-[1.5rem] bg-[black] rounded-full text-[white] cursor-pointer transition duration-300 ease-in-out relative overflow-hidden botonAnim">
									<span className="textButAnim">Iniciar Sesión</span>
								</li>
							</a>
						</ul>
					</div>
					<div
						className="md:hidden border-2 border-black p-[0.3rem] rounded-md menu-header"
						onClick={toggleMenu}
					>
						{menuOpen ? <CloseIcon /> : <MenuIcon />}
					</div>
				</div>
				{menuOpen && (
					<div className="md:hidden flex flex-col items-center mt-[1rem] space-y-4">
						<a href="/" className="text-[black] text-[20px]">
							Inicio
						</a>
						<a href="/login" className="text-[black] text-[20px]">
							Cursos
						</a>
						<a href="/login">
							<div className="p-[0.5rem] px-[1.5rem] bg-[black] rounded-full text-[white] cursor-pointer transition duration-300 ease-in-out">
								Iniciar Sesión
							</div>
						</a>
					</div>
				)}
			</div>
		</>
	);
}

export default Header;
