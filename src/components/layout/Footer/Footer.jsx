function Footer() {
	return (
		<>
			<div className="flex bg-white w-[100%] py-[2rem] px-[5rem] items-center justify-between footer-container">
				<div>
					<img src="logo.png" className="w-[10rem]" />
				</div>
				<div className="flex gap-7 flex-col footer-menu-container">
					<div className="flex items-center">
						<ul className="flex gap-10 cursor-pointer text-[black] text-[20px] footer-ul">
							<li className="flex items-center">Inicio</li>
							<li className="flex items-center separ">|</li>
							<a href="/login" className="">
								<li className="flex items-center">Cursos</li>
							</a>
							<li className="flex items-center separ">|</li>
							<a href="https://www.cooprogreso.fin.ec/">
								<li className="flex items-center">Contacto</li>
							</a>
							<li className="flex items-center separ">|</li>
							<a href="https://www.cooprogreso.fin.ec/">
								<li className="flex items-center">Sobre Nosotros</li>
							</a>
						</ul>
					</div>
					<div className="flex justify-center">
						<h3 className="text-[20px]">Terminos y Condiciones</h3>
					</div>
					<div className="flex gap-2 justify-center text-[20px]">
						<span>Website by{"  "}</span>
						<a
							className="text-[#18acd1]"
							href="https://kevinvillajim.github.io/Portfolio/"
						>
							kevinvillajim
						</a>
						<span>© 2024</span>
					</div>
				</div>
				<div className="flex flex-col justify-center gap-5 w-[20%] footer-button-container">
					<a
						href="/login"
						className="text-center p-[0.5rem] px-[1.5rem] bg-[black] rounded-full text-[white] cursor-pointer transition duration-300 ease-in-out relative overflow-hidden botonAnim"
					>
						<span className="textButAnim">Inciciar sesión</span>
					</a>
				</div>
			</div>
		</>
	);
}

export default Footer;
